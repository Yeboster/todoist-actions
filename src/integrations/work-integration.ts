import { TodoistClientType } from '../types'
import IIntegration from '../integration';
import { TodoistApi, Task } from '@doist/todoist-api-typescript';

type getWorkItemsType = { tasksInWorkProject: Task[], tasksWithWorkLabel: Task[] }

export default class WorkIntegration implements IIntegration {
  WORK_PROJECT = 'Work'
  MAIN_WORK_LABEL = 'work'
  WORK_LABELS = ['work', 'w']
  get name() {
    return 'Work'
  }

  async run(syncClient: TodoistClientType, restClient: TodoistApi) {
    const projects = await restClient.getProjects()
    const parentWorkProject = projects.find((project) => project.name.toLowerCase() === this.WORK_PROJECT)
    if (parentWorkProject == null) return

    const workProjectChildren = projects.filter((project) => project.parentId === parentWorkProject.id)
    const workProjects = [parentWorkProject, ...workProjectChildren]

    const { tasksInWorkProject, tasksWithWorkLabel } = await this.getWorkItems(restClient, workProjects.map((project) => project.name))

    await this.moveIntoWorkProject(syncClient, tasksWithWorkLabel, workProjects.map((project) => project.id), parentWorkProject.id)
    await this.addWorkLabel(syncClient, tasksInWorkProject)
  }
  
  async getWorkItems(client: TodoistApi, workProjectNames: string[]): Promise<getWorkItemsType> {
    const workProjectsFilter = workProjectNames.map((name) => `#${name}`).join(' | ')

    const tasksInWorkProject = await client.getTasks({ filter: workProjectsFilter })
    const tasksWithWorkLabel = await client.getTasks({ filter: `@${this.WORK_LABELS.join('|@')}` })

    return { tasksInWorkProject, tasksWithWorkLabel }
  }

  async moveIntoWorkProject(client: TodoistClientType, tasks: Task[], workProjectsId: string[], workProjectId: string) {
    await Promise.all(tasks.map(async (task) => {
      if (workProjectsId.includes(task.projectId)) return

      await client.items!.move({ id: task.id, project_id: workProjectId })
    }))
  }

  async addWorkLabel(client: TodoistClientType, tasks: Task[]) {
    await Promise.all(tasks.map(async (task) => {

      if (task.labels.includes(this.MAIN_WORK_LABEL)) return

      task.labels.push(this.MAIN_WORK_LABEL)
      await client.items!.update({ id: task.id, labels: task.labels })
    }))
  }
}
