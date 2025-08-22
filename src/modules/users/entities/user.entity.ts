import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  NORMAL_USER = 'normal_user',
}

export enum AdminType {
  FACILITY_ADMIN = 'facility_admin',
  SECURITY_ADMIN = 'security_admin',
  STUDENT_AFFAIRS = 'student_affairs',
}

export enum NormalUserType {
  STUDENT = 'student',
  CLUB = 'club',
  ASSOCIATION = 'association',
}

@Entity('users')
@Index(['email'])
@Index(['role'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    comment: 'Primary role category - admin or normal user',
  })
  @Index()
  role: UserRole;

  @Column({
    nullable: true,
    type: 'enum',
    enum: AdminType,
    comment: 'Specific admin type - only for admin role',
  })
  adminType?: AdminType;

  @Column({
    nullable: true,
    type: 'enum',
    enum: NormalUserType,
    comment: 'Specific user type - only for normal user role',
  })
  normalUserType?: NormalUserType;

  @Column({
    length: 100,
    comment: 'Full name of the user',
  })
  name: string;

  @Column({
    unique: true,
    length: 255,
    comment: 'Unique email address for login',
  })
  email: string;

  @Column({
    length: 255,
    select: false, // Don't select password by default for security
    comment: 'Hashed password',
  })
  password: string;

  @Column({
    type: 'boolean',
    default: true,
    comment: 'Whether the user account is active',
  })
  isActive: boolean;

  // @Column({
  //   type: 'boolean',
  //   default: false,
  //   comment: 'Whether the user email has been verified'
  // })
  // isEmailVerified: boolean;

  // @Column({
  //   nullable: true,
  //   length: 20,
  //   comment: 'Phone number for contact'
  // })
  // phoneNumber?: string;

  // @Column({
  //   nullable: true,
  //   type: 'text',
  //   comment: 'Additional notes about the user'
  // })
  // notes?: string;

  @Column({
    nullable: true,
    type: 'timestamp',
    comment: 'Last time the user logged in',
  })
  lastLoginAt?: Date;

  @CreateDateColumn({
    comment: 'When the user account was created',
  })
  createdAt: Date;

  @UpdateDateColumn({
    comment: 'When the user account was last updated',
  })
  updatedAt: Date;

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];

  // Validation method to ensure role consistency
  validateRoleConsistency(): boolean {
    if (this.role === UserRole.ADMIN) {
      return (
        this.adminType !== null &&
        this.adminType !== undefined &&
        this.normalUserType === null
      );
    } else if (this.role === UserRole.NORMAL_USER) {
      return (
        this.normalUserType !== null &&
        this.normalUserType !== undefined &&
        this.adminType === null
      );
    }
    return false;
  }

  // Role checking methods for RBAC
  get isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  get isNormalUser(): boolean {
    return this.role === UserRole.NORMAL_USER;
  }

  get isFacilityAdmin(): boolean {
    return (
      this.role === UserRole.ADMIN &&
      this.adminType === AdminType.FACILITY_ADMIN
    );
  }

  get isSecurityAdmin(): boolean {
    return (
      this.role === UserRole.ADMIN &&
      this.adminType === AdminType.SECURITY_ADMIN
    );
  }

  get isStudentAffairs(): boolean {
    return (
      this.role === UserRole.ADMIN &&
      this.adminType === AdminType.STUDENT_AFFAIRS
    );
  }

  get isStudent(): boolean {
    return (
      this.role === UserRole.NORMAL_USER &&
      this.normalUserType === NormalUserType.STUDENT
    );
  }

  get isClub(): boolean {
    return (
      this.role === UserRole.NORMAL_USER &&
      this.normalUserType === NormalUserType.CLUB
    );
  }

  get isAssociation(): boolean {
    return (
      this.role === UserRole.NORMAL_USER &&
      this.normalUserType === NormalUserType.ASSOCIATION
    );
  }

  // get isFaculty(): boolean {
  //   return (
  //     this.role === UserRole.NORMAL_USER &&
  //     this.normalUserType === NormalUserType.FACULTY
  //   );
  // }

  // get isStaff(): boolean {
  //   return (
  //     this.role === UserRole.NORMAL_USER &&
  //     this.normalUserType === NormalUserType.STAFF
  //   );
  // }

  // Get the specific role identifier for RBAC
  get specificRole(): string {
    if (this.role === UserRole.ADMIN && this.adminType) {
      return this.adminType;
    } else if (this.role === UserRole.NORMAL_USER && this.normalUserType) {
      return this.normalUserType;
    }
    return this.role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles: (AdminType | NormalUserType)[]): boolean {
    const userSpecificRole = this.specificRole;
    return roles.includes(userSpecificRole as AdminType | NormalUserType);
  }

  // Check if user has admin privileges
  hasAdminPrivileges(): boolean {
    return this.role === UserRole.ADMIN;
  }
}
