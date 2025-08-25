// src/components/admin/payroll/reports/RecognitionCertificate.tsx
'use client';

import Image from 'next/image';
import type { User, Evaluation } from '@/types/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface RecognitionCertificateProps {
  employee: User;
  evaluation: Evaluation;
}

export function RecognitionCertificate({ employee, evaluation }: RecognitionCertificateProps) {

  const formattedDate = format(new Date(), "'a los' d 'días del mes de' MMMM 'de' yyyy", { locale: es });
  
  return (
    <div className="w-full h-full p-12 flex flex-col justify-between items-center text-center font-serif bg-white" style={{ fontFamily: "'Times New Roman', serif"}}>
        {/* Header */}
        <div className="w-full flex flex-col items-center">
            <Image
            src="https://firebasestorage.googleapis.com/v0/b/anella-boutique.firebasestorage.app/o/public%2FLogo.png?alt=media&token=b2c1ff63-242c-40ed-bf19-406e84992d7f"
            alt="Anella Boutique Logo"
            width={200}
            height={50}
            className="object-contain"
            priority
            />
            <h1 className="text-4xl font-bold mt-8 tracking-wider uppercase">Certificado de Reconocimiento</h1>
        </div>

        {/* Content */}
        <div className="w-full text-center my-10">
            <p className="text-lg italic mt-4">Otorgado a:</p>
            <p className="text-5xl font-bold my-6 text-pink-700" style={{fontFamily: "'Brush Script MT', cursive"}}>{employee.name}</p>
            <p className="text-lg max-w-3xl mx-auto leading-relaxed">
               Por su destacado desempeño, compromiso y valiosa contribución a los objetivos de Anella Boutique durante el período de {evaluation.period}. Su dedicación es una inspiración para todo el equipo.
            </p>
        </div>

        {/* Footer */}
        <div className="w-full flex flex-col items-center">
             <Image
                src="https://firebasestorage.googleapis.com/v0/b/anella-boutique.firebasestorage.app/o/public%2Ffirma.png?alt=media&token=3c57fe5d-3545-4d7a-b4a2-6f414f2ba828"
                alt="Firma"
                width={200}
                height={100}
                className="object-contain"
            />
            <div className="w-64 border-t border-black mt-2"></div>
            <p className="text-md font-semibold mt-2">Gerencia General</p>
            <p className="text-sm mt-8">Cajamarca, {formattedDate}</p>
        </div>
    </div>
  );
}
