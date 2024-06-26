import { TodoistClientType } from '../types'
import IIntegration from '../integration'
import { TodoistApi } from '@doist/todoist-api-typescript';

export default class ChecklistIntegration implements IIntegration {
  get name() {
    return 'Checklists'
  }

  async run(syncClient: TodoistClientType, restClient: TodoistApi) {
    // Get parent checklists project
    const checklistProject = syncClient.projects!.get().find((project: { name: string; }) => project.name.toLowerCase() === 'checklists')

    // Get all children projects under checklist project
    const childProjects = syncClient.projects!.get().filter((project: { parent_id: string; }) => project.parent_id === checklistProject.id)

    // Get all tasks of checklist projects
    const checklistTasks = childProjects.map((project: { id: string; }) => syncClient.items!.get().filter((item: { project_id: string; }) => item.project_id === project.id)).flat()

    // Remove due date from all tasks
    for (const task of checklistTasks) {
      if (task.due === null) continue

      await syncClient.items!.update({ id: task.id, due: null })
    }
  }
}
