import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../common/entity/base.entity';
import { StorageFile } from './storage-file.entity';

@Entity('file_tags')
export class FileTag extends BaseEntity {
  @Column({ nullable: false })
  tag_name: string;

  @ManyToOne(() => StorageFile, (file) => file.tags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'file_id' })
  file: StorageFile;
}
