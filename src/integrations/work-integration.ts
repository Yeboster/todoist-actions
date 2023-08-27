import { TodoistV9Types as TodoistTypes } from 'todoist'
import { TodoistClientType } from '../types'
import IIntegration from '../integration';
import { TodoistApi } from '@doist/todoist-api-typescript';

type getWorkItemsType = { itemsInWorkProject: TodoistTypes.Item[], itemsWithWorkLabel: TodoistTypes.Item[] }

export default class WorkIntegration implements IIntegration {
  get name() {
    return 'Work'
  }

  async run(syncClient: TodoistClientType, restClient: TodoistApi) {
    const parentWorkProject = this.getWorkProject(syncClient)
    const workProjectChildrenIds = this.getWorkProjectChildren(syncClient, parentWorkProject).map((project) => project.id)
    const workProjectsId = [parentWorkProject.id, ...workProjectChildrenIds]
    const { itemsInWorkProject, itemsWithWorkLabel } = this.getWorkItems(syncClient, workProjectsId)

    await this.moveIntoWorkProject(syncClient, itemsWithWorkLabel, workProjectsId, parentWorkProject.id)
    await this.addWorkLabel(syncClient, itemsInWorkProject)
  }

  private get workLabel() {
    return 'work'
  }

  private getWorkProjectChildren(client: TodoistClientType, parentWorkProject: any) {
    return client.projects!.get().filter((project: { parent_id: string; }) => project.parent_id === parentWorkProject.id);
  }

  getWorkProject(client: TodoistClientType) {
    const workProject = client.projects!.get().find((project: { name: string; }) => project.name.toLowerCase() === this.workLabel)

    return workProject
  }

  getWorkItems(client: TodoistClientType, workProjectIds: string[]): getWorkItemsType {
    const itemsInWorkProject = client.items!.get().filter((item: { project_id: string | null; }) => item.project_id && workProjectIds.includes(item.project_id))
    const itemsWithWorkLabel = client.items!.get().filter((item: { labels: string | string[]; }) => item.labels.includes(this.workLabel))

    return { itemsInWorkProject, itemsWithWorkLabel }
  }

  async moveIntoWorkProject(client: TodoistClientType, items: any[], workProjectsId: string[], workProjectId: any) {
    await Promise.all(items.map(async (item: { project_id: any; id: any; }) => {
      if (workProjectsId.includes(item.project_id)) return

      await client.items!.move({ id: item.id, project_id: workProjectId })
    }))
  }

  async addWorkLabel(client: TodoistClientType, items: any[]) {
    await Promise.all(items.map(async (item: { labels: { includes: (arg0: string) => any; push: (arg0: string) => any; }; id: any; }) => {

      if (item.labels.includes(this.workLabel)) return

      item.labels.push(this.workLabel)
      await client.items!.update({ id: item.id, labels: item.labels })
    }))
  }
}
