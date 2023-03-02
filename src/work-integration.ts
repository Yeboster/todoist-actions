import { TodoistV9Types as TodoistTypes } from 'todoist'
import { TodoistClientType } from './types'

function getWorkProject(client: TodoistClientType) {
  const workProject = client.projects!.get().find((project: { name: string; }) => project.name.toLowerCase() === 'work')

  return workProject
}

type getWorkItemsType = { itemsInWorkProject: TodoistTypes.Item[], itemsWithWorkLabel: TodoistTypes.Item[] }
function getWorkItems(client: TodoistClientType, workProject = null): getWorkItemsType {
  if (workProject === null) workProject = getWorkProject(client)
  const itemsInWorkProject = client.items!.get().filter((item: { project_id: null; }) => item.project_id === workProject)
  const itemsWithWorkLabel = client.items!.get().filter((item: { labels: string | string[]; }) => item.labels.includes('work'))

  return { itemsInWorkProject, itemsWithWorkLabel }
}

async function moveIntoWorkProject(client: TodoistClientType, items: any[], workProjectId: any) {
  console.log('Moving items into work project...')
  await Promise.all(items.map(async (item: { project_id: any; id: any; }) => {
    if (item.project_id === workProjectId) return

    await client.items!.move({ id: item.id, project_id: workProjectId })
  }))
}

async function addWorkLabel(client: TodoistClientType, items: any[], workLabel = 'work') {
  console.log('Add work label to items...')
  await Promise.all(items.map(async (item: { labels: { includes: (arg0: string) => any; append: (arg0: string) => any; }; id: any; }) => {
    if (item.labels.includes(workLabel)) return

    const updatedLabels = item.labels.append('work')
    await client.items!.update({ id: item.id, labels: updatedLabels })
  }))
}

export async function normalizeWorkProject(client: TodoistClientType) {
  const workProject = getWorkProject(client)
  const { itemsInWorkProject, itemsWithWorkLabel } = getWorkItems(client, workProject)

  await moveIntoWorkProject(client, itemsWithWorkLabel, workProject.id)
  await addWorkLabel(client, itemsInWorkProject)
}