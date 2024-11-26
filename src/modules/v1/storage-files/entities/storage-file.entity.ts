import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entity/base.entity';
import { User } from '../../user/entities/user.entity';
import { FileTag } from './file-tag.entity';
import { FileView } from './file-view.entity';

@Entity('storage_files')
export class StorageFile extends BaseEntity {
  @Column('bigint', { nullable: false })
  size: number;

  @Column({ nullable: false, unique: true })
  file_name: string;

  @Column({ nullable: false })
  file_key: string;

  @Column({ nullable: false })
  file_content_type: string;

  @Column({ nullable: true })
  file_url: string;

  @ManyToOne(() => User, (user) => user.storageFiles, {
    createForeignKeyConstraints: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => FileTag, (fileTag) => fileTag.file, { cascade: true })
  tags: FileTag[];

  @OneToMany(() => FileView, (fileView) => fileView.file, { cascade: true })
  views: FileView[];

  viewCount?: number;
}
