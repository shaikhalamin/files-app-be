import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@/common/entity/base.entity';
import { StorageFile } from './storage-file.entity';

@Entity('file_views')
export class FileView extends BaseEntity {
  @Column({ nullable: false })
  viewer_ip: string;

  @Column({ nullable: true })
  viewer_id: string;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  viewed_at: Date;

  @ManyToOne(() => StorageFile, (file) => file.views, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'file_id' })
  file: StorageFile;
}
