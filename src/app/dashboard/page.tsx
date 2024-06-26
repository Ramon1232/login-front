"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Beneficiario {
  id_beneficiario: number;
  folio: number;
  curp: string;
  nombre: string;
  estatus: string;
  programa: string;
}

const Dashboard = () => {
  const { data: session, status } = useSession();
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  console.log(session);
  console.log(process.env.NEXT_PUBLIC_BACKEND_URL);

  const getBeneficiarios = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/beneficiarios`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Network response was not ok');
      }

      const data: Beneficiario[] = await res.json();
      setBeneficiarios(data);
      console.log(data);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={getBeneficiarios} className="btn btn-primary">
        Mostrar beneficiarios
      </button>
      {beneficiarios.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Folio</th>
              <th>CURP</th>
              <th>Nombre</th>
              <th>Estatus</th>
              <th>Programa</th>
            </tr>
          </thead>
          <tbody>
            {beneficiarios.map((beneficiario) => (
              <tr key={beneficiario.id_beneficiario}>
                <td>{beneficiario.id_beneficiario}</td>
                <td>{beneficiario.folio}</td>
                <td>{beneficiario.curp}</td>
                <td>{beneficiario.nombre}</td>
                <td>{beneficiario.estatus}</td>
                <td>{beneficiario.programa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Dashboard;
