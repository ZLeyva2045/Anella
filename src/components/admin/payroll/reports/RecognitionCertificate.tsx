// src/components/admin/payroll/reports/RecognitionCertificate.tsx
'use client';

import Image from 'next/image';
import type { User, Evaluation } from '@/types/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface RecognitionCertificateProps {
  employee: User;
  evaluation: Evaluation;
  feedbackComment: string;
}

export function RecognitionCertificate({ employee, evaluation, feedbackComment }: RecognitionCertificateProps) {

  const formattedDate = format(new Date(), "'a los' d 'días del mes de' MMMM 'de' yyyy", { locale: es });
  
  return (
    <div 
        className="w-full h-full p-8 flex flex-col justify-between items-center text-center font-serif bg-white relative" 
        style={{ fontFamily: "'Georgia', 'Times New Roman', serif"}}
    >
      {/* Decorative Borders */}
      <div className="absolute top-4 left-4 right-4 h-2 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300"></div>
      <div className="absolute bottom-4 left-4 right-4 h-2 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300"></div>
      <div className="absolute top-4 bottom-4 left-4 w-2 bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-300"></div>
      <div className="absolute top-4 bottom-4 right-4 w-2 bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-300"></div>
      <div className="absolute top-6 left-6 right-6 bottom-6 border-2 border-amber-500"></div>


      {/* Header */}
      <div className="w-full flex flex-col items-center z-10">
        <Image
          src="https://firebasestorage.googleapis.com/v0/b/anella-boutique.firebasestorage.app/o/public%2FLogo.png?alt=media&token=b2c1ff63-242c-40ed-bf19-406e84992d7f"
          alt="Anella Boutique Logo"
          width={180}
          height={45}
          className="object-contain"
          priority
        />
        <h1 className="text-4xl font-bold mt-6 tracking-widest uppercase text-gray-800">Certificado de Reconocimiento</h1>
      </div>

      {/* Content */}
      <div className="w-full text-center my-8 z-10">
        <p className="text-lg italic mt-4 text-gray-600">Otorgado a:</p>
        <p className="text-5xl font-bold my-4" style={{ fontFamily: "'Brush Script MT', cursive", color: '#b45309' }}>{employee.name}</p>
        <p className="text-lg max-w-2xl mx-auto leading-relaxed text-gray-700">
           Por su destacada labor durante el período de <strong>{evaluation.period}</strong>. En particular, se reconoce:
        </p>
         <blockquote className="text-lg max-w-2xl mx-auto leading-relaxed text-gray-800 italic mt-4 p-4 bg-amber-50/50 border-l-4 border-amber-400">
            &quot;{feedbackComment}&quot;
        </blockquote>
         <p className="text-lg max-w-2xl mx-auto leading-relaxed text-gray-700 mt-4">
           Su dedicación es una inspiración para todo el equipo y un pilar fundamental para el éxito de Anella Boutique.
        </p>
      </div>

      {/* Footer */}
      <div className="w-full flex flex-col items-center z-10">
         <Image
            src="https://firebasestorage.googleapis.com/v0/b/anella-boutique.firebasestorage.app/o/public%2Ffirma.png?alt=media&token=3c57fe5d-3545-4d7a-b4a2-6f414f2ba828"
            alt="Firma"
            width={180}
            height={90}
            className="object-contain -mb-4"
        />
        <div className="w-56 border-t border-gray-700"></div>
        <p className="text-md font-semibold mt-2 text-gray-800">Gerencia General</p>
        <p className="text-sm mt-6 text-gray-500">Cajamarca, {formattedDate}</p>
      </div>
    </div>
  );
}
