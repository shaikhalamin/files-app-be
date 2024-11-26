import { BeforeInsert, Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entity/base.entity';
import * as bcrypt from 'bcrypt';
import { StorageFile } from '../../storage-files/entities/storage-file.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ nullable: false })
  first_name: string;

  @Column({ nullable: false })
  last_name: string;

  @Column({ nullable: false })
  @Index('usersUniqueEmail', { unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false })
  @Index('usersUniquePhone', { unique: true })
  phone: string;

  @Column({ default: false })
  is_active: boolean;

  // @Column({ default: 'customer' })
  // role: string;

  @OneToMany(() => StorageFile, (storageFile) => storageFile.user)
  storageFiles: StorageFile[];

  @BeforeInsert()
  async hashPassword() {
    this.password = this.passwordHash(this.password);
  }

  passwordHash(plainPassword: string) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(plainPassword, salt);
  }

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}
