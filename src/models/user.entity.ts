import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Gender } from './enum';

@Entity({
  name: 'users',
})
export class UserEntity extends BaseEntity {
  @Column({
    type: 'varchar',
    name: 'name',
    length: 200,
  })
  name: String;

  @Column({
    type: 'varchar',
    name: 'nickname',
    length: 50,
    nullable: true,
    unique: true,
  })
  nickname: String;

  @Column({
    type: 'varchar',
    name: 'phone',
    length: 15,
    unique: true,
  })
  phone: String;

  @Column({
    type: 'varchar',
    name: 'email',
    length: 200,
    unique: true,
  })
  email: String;

  @Column({
    type: 'text',
    name: 'password',
  })
  password: String;

  @Column({
    type: 'date',
    name: 'dob',
  })
  dob: Date;

  @Column({
    type: 'varchar',
    name: 'avatar',
    nullable: true,
  })
  avatar: String;

  @Column({
    type: 'enum',
    name: 'gender',
    nullable: true,
    enum: Gender,
  })
  gender: Gender;

  @Column({
    type: 'boolean',
    name: 'is_verified',
    default: false,
  })
  isVerified: Boolean;
}
