import { Migration } from '@mikro-orm/migrations';

export class Migration20261013192505_init extends Migration {

  override name = 'Migration20261013192505_init';

  override up(): void | Promise<void> {
    this.addSql(`create table "gardens" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(120) not null, "description" text null, primary key ("id"));`);
  }

}
