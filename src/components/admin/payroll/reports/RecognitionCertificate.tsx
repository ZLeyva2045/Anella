// src/components/admin/payroll/reports/RecognitionCertificate.tsx
'use client';

import Image from 'next/image';
import type { User, Evaluation } from '@/types/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface RecognitionCertificateProps {
  employee: User;
  evaluation: Evaluation;
  certificateContent: string;
}

export function RecognitionCertificate({ employee, evaluation, certificateContent }: RecognitionCertificateProps) {

  const formattedDate = format(new Date(), "'a los' d 'días del mes de' MMMM 'de' yyyy", { locale: es });
  
  return (
    <>
    {/* This style tag is specific to this component and won't cause hydration issues */}
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;700;800&family=Parisienne&display=swap');
    `}</style>
    <div 
      className="w-full h-full p-10 flex flex-col justify-between items-center text-center bg-white relative" 
      style={{ fontFamily: "'Lexend', sans-serif" }}
    >
      {/* Borders and Corners */}
      <div className="absolute inset-2 border-2 border-amber-400"></div>
      <div className="absolute inset-4 border border-amber-300"></div>
      
      {/* Corner decorations */}
      <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 overflow-hidden">
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-tr from-amber-400 to-amber-600 transform rotate-45"></div>
        <div className="absolute -bottom-20 -left-12 w-48 h-48 bg-gray-800 transform rotate-45"></div>
      </div>
       <div className="absolute bottom-0 right-0 w-48 h-48 md:w-64 md:h-64 overflow-hidden">
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-gradient-to-tl from-amber-400 to-amber-600 transform -rotate-45"></div>
        <div className="absolute -bottom-20 -right-12 w-48 h-48 bg-gray-800 transform -rotate-45"></div>
      </div>


      {/* Header */}
      <div className="w-full flex flex-col items-center z-10">
        <Image
          src="https://firebasestorage.googleapis.com/v0/b/anella-boutique.firebasestorage.app/o/public%2FLogo.png?alt=media&token=b2c1ff63-242c-40ed-bf19-406e84992d7f"
          alt="Anella Boutique Logo"
          width={120}
          height={30}
          className="object-contain"
          priority
        />
        <h1 className="text-4xl font-bold mt-4 tracking-wider uppercase text-gray-800">Certificado</h1>
        <div className="relative mt-2">
            <div className="absolute inset-0 bg-amber-500 transform -skew-y-2"></div>
            <h2 className="relative px-6 py-1 text-lg font-semibold tracking-widest text-white">DE RECONOCIMIENTO</h2>
        </div>
      </div>

      {/* Content */}
      <div className="w-full text-center my-8 z-10 px-4">
        <p className="text-md italic mt-4 text-gray-600">Otorgado a:</p>
        <p className="text-6xl my-2" style={{ fontFamily: "'Parisienne', cursive", color: '#111827' }}>{employee.name}</p>
        <div className="flex items-center justify-center my-4">
            <span className="h-px w-16 bg-amber-400"></span>
            <span className="w-2 h-2 rounded-full bg-amber-400 mx-2"></span>
            <span className="h-px w-16 bg-amber-400"></span>
        </div>
        <blockquote className="text-md max-w-xl mx-auto leading-relaxed text-gray-600 italic mt-2">
            {certificateContent}
        </blockquote>
      </div>

      {/* Footer */}
      <div className="w-full flex flex-col items-center z-10">
        <div className="flex items-center justify-center mb-2">
            <span className="h-px w-12 bg-amber-400"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mx-2"></span>
            <span className="h-px w-12 bg-amber-400"></span>
        </div>
        <p className="text-md font-semibold text-gray-800">Ana Gabriela Urteaga Aguilar</p>
        <p className="text-sm text-gray-500">Gerente General</p>
      </div>
    </div>
    </>
  );
}
