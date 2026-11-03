import { Migration } from '@mikro-orm/migrations';

export class Migration20261103195000_add_users extends Migration {

  override name = 'Migration20261103195000_add_users';

  override up(): void | Promise<void> {
    this.addSql(`create table "users" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "email" varchar(254) not null, "password_hash" varchar(100) not null, "email_verified_at" timestamptz null, primary key ("id"));`);
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "users" cascade;`);
  }

}
