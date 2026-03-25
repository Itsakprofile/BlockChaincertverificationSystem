
import { StudentProfile, Credentials, CertificateRecord } from '../types';

export class StoreService {
  private static readonly STORAGE_KEY = 'sl_university_students';

  static generateUniqueCertId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return `CERT-${crypto.randomUUID().toUpperCase()}`;
    }
    return `CERT-${Math.random().toString(36).substr(2, 12).toUpperCase()}`;
  }

  /**
   * Retrieves all students from localStorage
   * @returns StudentProfile[] - Array of all student records
   */
  static getStudents(): StudentProfile[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored) as StudentProfile[];
    } catch (error) {
      console.error('Failed to parse students from storage', error);
      return [];
    }
  }

  /**
   * Retrieves a student by register number
   */
  static getStudentByRegisterNumber(registerNumber: string): StudentProfile | undefined {
    return this.getStudents().find(s => s.registerNumber.trim().toLowerCase() === registerNumber.trim().toLowerCase());
  }

  /**
   * Retrieves all students with a given login
   */
  static getStudentsByLogin(loginId: string): StudentProfile[] {
    return this.getStudents().filter(s => s.loginId === loginId);
  }

  /**
   * Saves a student record to localStorage; if reg number exists keeps login credentials.
   */
  static saveStudent(student: StudentProfile): void {
    const students = this.getStudents();
    const existing = this.getStudentByRegisterNumber(student.registerNumber);

    // Preserve login credentials to prevent creating multiple logins for same register number
    if (existing) {
      student.loginId = existing.loginId;
      student.passwordHash = existing.passwordHash;
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...students, student]));
    } catch (error) {
      console.error('Failed to save student to storage', error);
      throw new Error('Failed to save student: Storage quota may be exceeded');
    }
  }

  /**
   * Retrieves a student by their certificate ID
   */
  static getStudentById(id: string): StudentProfile | undefined {
    return this.getStudents().find(s => s.id === id);
  }

  /**
   * Retrieves a student by their login ID
   */
  static getStudentByLogin(loginId: string): StudentProfile | undefined {
    return this.getStudents().find(s => s.loginId === loginId);
  }

  /**
   * Generates login credentials for a new student
   */
  static generateCredentials(name: string, regNo: string): Credentials {
    const cleanName = name.toLowerCase().trim().replace(/\s+/g, '');
    const loginId = `${cleanName}${regNo.slice(-4)}`;
    const password = Math.random().toString(36).slice(-8);
    return { loginId, password };
  }

  /**
   * Adds a certificate to an existing student (by register number) and returns new certificate record
   */
  static addCertificateToExistingStudent(registerNumber: string, certificate: CertificateRecord, studentInfo: Omit<StudentProfile, 'id' | 'loginId' | 'passwordHash' | 'createdAt' | 'certificateBase64' | 'certificatePdfHash'>): StudentProfile | null {
    const existing = this.getStudentByRegisterNumber(registerNumber);
    if (!existing) return null;

    const newRecord: StudentProfile = {
      ...studentInfo,
      id: certificate.certId,
      loginId: existing.loginId,
      passwordHash: existing.passwordHash,
      photoBase64: existing.photoBase64,
      collegeName: existing.collegeName,
      createdAt: Date.now(),
      certificateBase64: certificate.certificateBase64,
      certificatePdfHash: certificate.certificatePdfHash,
      certificates: existing.certificates ? [...existing.certificates, certificate] : [certificate]
    };

    this.saveStudent(newRecord);
    return newRecord;
  }
}
