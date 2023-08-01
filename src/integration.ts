import { TodoistClientType } from "./types";

export default interface IIntegration {
  get name(): string
  run(client: TodoistClientType): Promise<void>
}
