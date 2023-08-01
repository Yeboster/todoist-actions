import { v9 as Todoist } from 'todoist'
import { TodoistClientType } from './types'
import WorkIntegration, { normalizeWorkProject } from './work-integration'

async function syncClient(client: TodoistClientType) {
  await client.sync(['items', 'projects', 'labels'])
}

const integrations = [
  new WorkIntegration(),
]

async function runWorkflows(client: TodoistClientType) {
  console.log('Syncing with Todoist...')
  await syncClient(client)

  for (const integration of integrations) {
    console.log(`Running '${integration.name}' integration...`)
    await integration.run(client)
  }

  console.log('Done!\n')
}

async function recurrentSetTimout(callback: () => void, delay: number) {
  await callback()
  setTimeout(() => recurrentSetTimout(callback, delay), delay)
}

async function main() {
  if (process.env.TODOIST_API_KEY == null)
    throw new Error('TODOIST_API_KEY is not set')

  console.log('*** Todoist Actions ***')
  const client = Todoist(process.env.TODOIST_API_KEY)

  await runWorkflows(client)
  recurrentSetTimout(async () => await runWorkflows(client), 5 * 60_000) // Every 5 minutes
}

main()
