import { v9 as Todoist } from 'todoist'
import { TodoistClientType } from './types'
import { normalizeWorkProject } from './work-integration'

async function syncClient(client: TodoistClientType) {
  await client.sync(['items', 'projects', 'labels'])
}
async function main() {
  if (process.env.TODOIST_API_KEY == null)
    throw new Error('TODOIST_API_KEY is not set')

  console.log('*** Todoist Actions ***')
  const client = Todoist(process.env.TODOIST_API_KEY)

  console.log('Syncing with Todoist...')
  await syncClient(client)

  await normalizeWorkProject(client)
}

main()
