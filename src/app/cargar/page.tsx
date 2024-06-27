"use client";
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

interface Beneficiario {
  id_beneficiario: number;
  folio: number;
  curp: string;
  nombre: string;
  estatus: string;
  programa: string;
}

const ImportarExcel = () => {
  const { data: session, status } = useSession();
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: Beneficiario[] = XLSX.utils.sheet_to_json(worksheet);
        setBeneficiarios(jsonData);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/beneficiarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify(beneficiarios),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Network response was not ok');
      }

      const result = await res.json();
      console.log(result);
      alert('Datos enviados exitosamente');
      setError(null);
      generatePDF(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('There was a problem with the fetch operation:', error);
        setError(error.message);
      } else {
        console.error('Unknown error occurred:', error);
        setError('An unknown error occurred');
      }
    }
  };

  const generatePDF = (result: any) => {
    const doc = new jsPDF();
    const currentDate = new Date();
    const date = currentDate.toLocaleDateString();
    const time = currentDate.toLocaleTimeString();
    const numBeneficiarios = result.length;
  
    // Título y detalles del documento
    doc.setFontSize(16);
    doc.text('Acuse de Registro de Beneficiarios', 10, 10);
    doc.setFontSize(12);
    doc.text(`Fecha de Registro: ${date}`, 10, 20);
    doc.text(`Hora de Registro: ${time}`, 10, 30);
    doc.text(`Número de Beneficiarios Registrados: ${numBeneficiarios}`, 10, 40);
  
    // Definir posiciones y dimensiones de las celdas de la tabla
    const startX = 10;
    const startY = 50;
    const cellWidth = 50;
    const cellHeight = 10;
    const xOffset = cellWidth;
  
    // Dibujar los títulos de las columnas
    doc.setLineWidth(0.1);
    doc.line(startX, startY, startX + cellWidth * 3, startY); // Línea horizontal encima de los títulos
    doc.text('CURP', startX, startY + 7);
    doc.text('Nombre', startX + xOffset, startY + 7);
    doc.text('Programa', startX + xOffset * 2, startY + 7);
  
    // Dibujar las líneas verticales de las celdas
    doc.line(startX, startY, startX, startY + cellHeight * (result.length + 1)); // Línea vertical a la izquierda
    doc.line(startX + cellWidth, startY, startX + cellWidth, startY + cellHeight * (result.length + 1)); // Línea vertical entre CURP y Nombre
    doc.line(startX + cellWidth * 2, startY, startX + cellWidth * 2, startY + cellHeight * (result.length + 1)); // Línea vertical entre Nombre y Programa
    doc.line(startX + cellWidth * 3, startY, startX + cellWidth * 3, startY + cellHeight * (result.length + 1)); // Línea vertical a la derecha
  
    // Iterar sobre cada beneficiario y colocar sus datos en la tabla
    result.forEach((beneficiario: Beneficiario, index: number) => {
      const textY = startY + (index + 1) * cellHeight; // Calcular la posición vertical de la fila
      doc.text(beneficiario.curp, startX + 2, textY); // CURP
      doc.text(beneficiario.nombre, startX + xOffset + 2, textY); // Nombre
      doc.text(beneficiario.programa, startX + xOffset * 2 + 2, textY); // Programa
  
      // Dibujar las líneas horizontales entre filas
      doc.line(startX, textY + 2, startX + cellWidth * 3, textY + 2); // Línea horizontal debajo de cada fila
    });
  
    // Guardar el documento PDF
    doc.save('acuse_registro.pdf');
  };
  

  return (
    <div>
      <h1>Importar Beneficiarios desde Excel</h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {beneficiarios.length > 0 && (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Folio</th>
                <th>CURP</th>
                <th>Nombre</th>
                <th>Estatus</th>
                <th>Programa</th>
              </tr>
            </thead>
            <tbody>
              {beneficiarios.map((beneficiario, index) => (
                <tr key={index}>
                  <td>{beneficiario.folio}</td>
                  <td>{beneficiario.curp}</td>
                  <td>{beneficiario.nombre}</td>
                  <td>{beneficiario.estatus}</td>
                  <td>{beneficiario.programa}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleSubmit} className="btn btn-primary">
            Registrar beneficiarios
          </button>
        </>
      )}
    </div>
  );
};

export default ImportarExcel;
