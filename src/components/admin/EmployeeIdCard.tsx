// src/components/admin/EmployeeIdCard.tsx
'use client';

import Image from 'next/image';
import type { User } from '@/types/firestore';

interface EmployeeIdCardProps {
  employee: User;
}

export function EmployeeIdCard({ employee }: EmployeeIdCardProps) {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${employee.id}`;

  return (
    <div 
      className="bg-white rounded-xl shadow-lg flex items-center space-x-4 relative overflow-hidden font-sans"
      // Approx dimensions for 8.5cm x 5.5cm at 96 DPI
      style={{ width: '321px', height: '208px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="absolute top-0 left-0 w-full h-2 bg-pink-400"></div>
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-pink-100 rounded-full"></div>
      
      <div className="flex-shrink-0 p-4 z-10">
        <Image
          src={employee.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=random`}
          alt={`Foto de ${employee.name}`}
          width={96}
          height={128}
          className="rounded-lg object-cover border-2 border-white shadow-md"
          style={{ width: '96px', height: '128px' }}
        />
      </div>
      
      <div className="flex-1 py-4 pr-4 z-10">
        <div className="space-y-1">
          <p className="text-gray-500 text-xs uppercase tracking-wider">ID de Empleado</p>
          <div className="text-xl font-bold text-gray-900 line-clamp-2">{employee.name}</div>
          <p className="text-pink-600 font-semibold capitalize">{employee.role}</p>
        </div>
        
        <div className="absolute bottom-4 right-4">
            <Image
                src={qrCodeUrl}
                alt="Código QR del empleado"
                width={60}
                height={60}
                className="rounded-md"
            />
        </div>
      </div>

       <Image
          src="https://i.ibb.co/MyXzBh0r/Anella.png"
          alt="Anella Boutique Logo"
          width={60}
          height={15}
          className="object-contain absolute top-4 right-4 z-10 opacity-70"
        />
    </div>
  );
}
