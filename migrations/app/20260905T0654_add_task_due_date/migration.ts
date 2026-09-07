#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/67bb17cbea24b5e8a63dcd0e3c0d45e52153c9684816a60cb735eba84acf62d9/contract';
import startContract from '../../snapshots/67bb17cbea24b5e8a63dcd0e3c0d45e52153c9684816a60cb735eba84acf62d9/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/faaf53d55f5a1e1e7b4d79eb8259f5466dd0269647df517b3494b1e0a481c4a9/contract';
import endContract from '../../snapshots/faaf53d55f5a1e1e7b4d79eb8259f5466dd0269647df517b3494b1e0a481c4a9/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'task',
        column: col('dueDate', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
