import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({
  name: 'kakao-ids',
})
export class KakaoIdentityEntity extends BaseEntity {
  @Column({
    type: 'varchar',
    name: 'access_token',
    length: 200,
  })
  accessToken: String;

  @Column({
    type: 'varchar',
    name: 'kakao_user_id',
    length: 50,
    nullable: true,
  })
  kakaoUserId: String;

  @Column({
    type: 'varchar',
    name: 'user_id',
    nullable: false,
  })
  userId: String;
  
}
