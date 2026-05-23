import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1710000000000 implements MigrationInterface {
  name = 'InitSchema1710000000000';

  public async up(_queryRunner: QueryRunner): Promise<void> {
    // Schema currently managed via entities.
    // Add explicit SQL migrations here before enabling TYPEORM_RUN_MIGRATIONS=true in production.
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // no-op
  }
}
