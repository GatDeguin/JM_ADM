import { Injectable } from "@nestjs/common";
import { UsersRepository } from "../infrastructure/users.repository";
import { ActionUserInput, CreateUserInput, UserDto, UpdateUserInput } from "../domain/users.types";

@Injectable()
export class UsersService {
  constructor(private readonly repository: UsersRepository) {}

  list(): Promise<UserDto[]> { return this.repository.list(); }
  get(id: string): Promise<UserDto> { return this.repository.get(id); }
  create(data: CreateUserInput): Promise<UserDto> { return this.repository.create(data); }
  update(id: string, data: UpdateUserInput): Promise<UserDto> { return this.repository.update(id, data); }
  remove(id: string) { return this.repository.remove(id); }
  runAction(id: string, payload: ActionUserInput): Promise<UserDto> { return this.repository.runAction(id, payload); }
}
