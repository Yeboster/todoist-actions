import { v9 as Todoist } from 'todoist'
import { TodoistClientType } from './types'
import { normalizeWorkProject } from './work-integration'

async function syncClient(client: TodoistClientType) {
  await client.sync(['items', 'projects', 'labels'])
}

async function workFlow(client: TodoistClientType) {
  console.log('Syncing with Todoist...')
  await syncClient(client)

  console.log('Normalizing work project...')
  await normalizeWorkProject(client)

  console.log('Done!\n')
}

async function main() {
  if (process.env.TODOIST_API_KEY == null)
    throw new Error('TODOIST_API_KEY is not set')

  console.log('*** Todoist Actions ***')
  const client = Todoist(process.env.TODOIST_API_KEY)

  await workFlow(client)
  setTimeout(async () => await workFlow(client), 5 * 60_000) // Every 5 minutes
}

main()
