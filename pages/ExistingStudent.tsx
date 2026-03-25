import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreService } from '../services/store';
import { BlockchainService } from '../services/blockchain';
import { StudentProfile, CertificateRecord } from '../types';

export const ExistingStudent: React.FC = () => {
  const [registerNumber, setRegisterNumber] = useState('');
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [certificate, setCertificate] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  }

  const searchStudent = () => {
    if (!registerNumber.trim()) {
      setError('Enter a register number to search.');
      setStudent(null);
      return;
    }
    setError('');
    const found = StoreService.getStudentByRegisterNumber(registerNumber.trim());
    if (!found) {
      setStudent(null);
      setStatus('Student not found.');
      setError('No student found with this register number.');
      return;
    }
    setStudent(found);
    setStatus(`Found student ${found.name} (${found.registerNumber})`);
    setError('');
  };

  const handleUploadCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) {
      setError('Search and select an existing student first.');
      return;
    }
    if (!certificate) {
      setError('Select a certificate PDF to upload.');
      return;
    }

    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const certHash = await BlockchainService.hashFile(certificate);
      const certBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(certificate);
      });

      const certId = StoreService.generateUniqueCertId();
      const record: CertificateRecord = {
        certId,
        fileName: certificate.name,
        certificateBase64: certBase64,
        certificatePdfHash: certHash,
        issuedAt: Date.now()
      };

      const createdProfile = StoreService.addCertificateToExistingStudent(student.registerNumber, record, {
        name: student.name,
        registerNumber: student.registerNumber,
        degree: student.degree,
        department: student.department,
        collegeName: student.collegeName,
        admissionDate: student.admissionDate,
        yearOfPassing: student.yearOfPassing,
        photoBase64: student.photoBase64,
        certificates: student.certificates || []
      } as any);

      if (!createdProfile) {
        setError('Failed to attach certificate to student. Student does not exist.');
        return;
      }

      await BlockchainService.addBlock({
        certificateId: certId,
        studentName: student.name,
        registerNumber: student.registerNumber,
        pdfHash: certHash,
        status: 'ISSUED'
      });

      setSuccess('Certificate successfully uploaded for existing student.');
      setStudent(createdProfile);
      setCertificate(null);
    } catch (err) {
      console.error(err);
      setError('Failed to upload certificate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="academic-serif text-3xl font-bold text-slate-900">Existing Student Upload</h2>
          <button onClick={() => navigate('/admin-dashboard')} className="bg-blue-900 text-white px-4 py-2 rounded-lg">Back to Dashboard</button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Register Number</label>
              <input value={registerNumber} onChange={e => setRegisterNumber(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="Enter register number" />
            </div>
            <button onClick={searchStudent} className="bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 px-4 font-bold">Search</button>
          </div>

          {status && <div className="text-sm font-semibold text-slate-700">{status}</div>}
          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg">{error}</div>}
          {success && <div className="bg-green-50 text-green-700 p-3 rounded-lg">{success}</div>}

          {student && (
            <>
              <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                <p><strong>Name:</strong> {student.name}</p>
                <p><strong>Register:</strong> {student.registerNumber}</p>
                <p><strong>Login ID:</strong> {student.loginId}</p>
                <p><strong>Total Certificates:</strong> {StoreService.getStudentsByLogin(student.loginId).length}</p>
              </div>

              <form onSubmit={handleUploadCertificate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Certificate PDF</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleChooseFile}
                      className="rounded-lg bg-gradient-to-r from-blue-700 to-blue-900 text-white px-5 py-2.5 text-sm font-semibold hover:from-blue-600 hover:to-blue-800 transition shadow-lg"
                    >
                      Upload Certificate
                    </button>
                    <span className="text-sm text-slate-600">
                      {certificate ? certificate.name : 'No file selected'}
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={e => setCertificate(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </div>
                <button type="submit" disabled={loading || !student} className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold disabled:bg-slate-300">
                  {loading ? 'Uploading...' : 'Upload Certificate for Existing Student'}
                </button>
              </form>
            </>
          )}

          {student && student.certificates && student.certificates.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-600 mb-2">Already Issued Certificates</h3>
              <ul className="space-y-2">
                {student.certificates.map(cert => (
                  <li key={cert.certId} className="p-3 bg-white border border-slate-200 rounded-lg text-xs">
                    <div><strong>ID:</strong> {cert.certId}</div>
                    <div><strong>Filename:</strong> {cert.fileName}</div>
                    <div><strong>Hash:</strong> {cert.certificatePdfHash}</div>
                    <div><strong>Issued:</strong> {new Date(cert.issuedAt).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
