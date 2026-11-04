import { Migration } from '@mikro-orm/migrations';

export class Migration20261103200741_add_garden_owner extends Migration {

  override name = 'Migration20261103200741_add_garden_owner';

  override up(): void | Promise<void> {
    // Spec A: existing rows are bootstrap/demo data from the unauthenticated admin form and have
    // no possible owner, so they are deleted before owner_id becomes NOT NULL. `down` can't restore them.
    this.addSql(`delete from "gardens";`);
    this.addSql(`alter table "gardens" add "owner_id" uuid not null;`);
    this.addSql(`alter table "gardens" add constraint "gardens_owner_id_foreign" foreign key ("owner_id") references "users" ("id") on delete cascade;`);
    this.addSql(`create index "gardens_owner_id_index" on "gardens" ("owner_id");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "gardens" drop constraint "gardens_owner_id_foreign";`);

    this.addSql(`drop index "gardens_owner_id_index";`);
    this.addSql(`alter table "gardens" drop column "owner_id";`);
  }

}
