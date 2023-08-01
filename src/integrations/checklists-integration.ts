import { TodoistClientType } from '../types'
import IIntegration from '../integration'

export default class ChecklistIntegration implements IIntegration {
  get name() {
    return 'Checklists'
  }

  async run(client: TodoistClientType) {
    // Get parent checklists project
    const checklistProject = client.projects!.get().find((project: { name: string; }) => project.name.toLowerCase() === 'checklists')

    // Get all children projects under checklist project
    const childProjects = client.projects!.get().filter((project: { parent_id: string; }) => project.parent_id === checklistProject.id)

    // Get all tasks of checklist projects
    const checklistTasks = childProjects.map((project: { id: string; }) => client.items!.get().filter((item: { project_id: string; }) => item.project_id === project.id)).flat()

    // Remove due date from all tasks
    await Promise.all(checklistTasks.map(async (task: { id: string; }) => {
      await client.items!.update({ id: task.id, due: null })
    }))
  }
}
