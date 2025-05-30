// common/dto/create-user.dto.ts
export class CreateUserDTO {
    username: string;
    password: string;

    constructor(username: string, password: string) {
      this.username = username;
      this.password = password;
    }
}
