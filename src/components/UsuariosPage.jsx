import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "/src/img/unirumbo.jpg"; 

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    fetch("https://localhost:7086/api/Usuarios")
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch((err) => console.error("Error al obtener usuarios:", err));
  }, []);

  const generarPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const COLORS = {
      primary: [11, 95, 255],
      primaryDark: [20, 79, 232],
      bg: [234, 243, 251],
      text: [15, 23, 42],
      muted: [107, 114, 128],
      rowAlt: [250, 252, 255],
      card: [255, 255, 255],
      success: [20, 184, 166],
      successBg: [236, 254, 255],
      successBorder: [195, 247, 242],
    };

    doc.setFillColor(...COLORS.bg);
    doc.rect(0, 0, W, H, "F");

    const headerX = 32;
    const headerY = 32;
    const headerW = W - headerX * 2;
    const headerH = 64;
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(headerX, headerY, headerW, headerH, 14, 14, "F");

    if (logo) {
      doc.addImage(logo, "PNG", headerX + 10, headerY + 8, 100, 45);
    }

    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("Reporte de Usuarios", headerX + 130, headerY + 40);

    doc.setTextColor(...COLORS.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Listado de cuentas del sistema UniRumbo", headerX + 2, headerY + headerH + 24);

    const badgeText = "Activo";
    const bPadX = 10;
    const badgeW = doc.getTextWidth(badgeText) + bPadX * 2;
    const badgeH = 18;
    const badgeX = W - headerX - badgeW;
    const badgeY = headerY + headerH + 12;
    doc.setFillColor(...COLORS.successBg);
    doc.setDrawColor(...COLORS.successBorder);
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 9, 9, "FD");
    doc.setTextColor(...COLORS.success);
    doc.text(badgeText, badgeX + bPadX, badgeY + 12);

    const cardX = 32;
    const cardY = headerY + headerH + 40;
    const cardW = W - cardX * 2;
    const cardH = H - cardY - 72;
    doc.setFillColor(...COLORS.card);
    doc.setDrawColor(240, 244, 251);
    doc.roundedRect(cardX, cardY, cardW, cardH, 16, 16, "FD");

    const marginLeft = 48;
    const marginRight = 48;
    const marginTop = cardY + 20;
    const marginBottom = 72;

    autoTable(doc, {
  startY: marginTop,
  margin: { left: marginLeft, right: marginRight, top: marginTop, bottom: marginBottom },
  head: [["ID", "Nombre", "Apellido", "Correo", "Rol"]],
  body: usuarios.map((u) => [
    u.idUsuario,
    u.nombre,
    u.apellido,
    u.correo,
    u.id_rol,
  ]),
  styles: {
    font: "helvetica",
    fontSize: 10,
    textColor: COLORS.text,
    lineColor: [230, 238, 252],
    lineWidth: 0.6,
    cellPadding: { top: 6, right: 8, bottom: 6, left: 8 },
    halign: "left",
    valign: "middle",
  },
  headStyles: {
    fillColor: COLORS.primary,
    textColor: [255, 255, 255],
    fontStyle: "bold",
    lineColor: COLORS.primaryDark,
    lineWidth: 0.6,
  },
  bodyStyles: { fillColor: [255, 255, 255] },
  alternateRowStyles: { fillColor: COLORS.rowAlt },
  tableLineColor: [226, 238, 252],
  tableLineWidth: 0.6,
  theme: "grid",

  didDrawPage: (data) => {
    const usuarioActual = "Administrador"; // 🔹 Cambia esto dinámicamente según tu sistema
    const fechaHora = new Date().toLocaleString("es-CO", {
      dateStyle: "short",
      timeStyle: "short",
      hour12: false,
    });

    const str = `Página ${doc.internal.getNumberOfPages()}`;
    const info = `Generado por: ${usuarioActual} | ${fechaHora}`;

    doc.setFontSize(10);
    doc.setTextColor(...COLORS.muted);

    // 🕓 Texto lado izquierdo: sitio web
    doc.text("UniRumbo · www.unirumbo.app", 32, H - 28);

    // 📄 Texto centro: usuario y fecha
    const infoWidth = doc.getTextWidth(info);
    doc.text(info, (W - infoWidth) / 2, H - 28);

    // 📘 Texto lado derecho: número de página
    const strWidth = doc.getTextWidth(str);
    doc.text(str, W - 32 - strWidth, H - 28);
  },
});



    doc.save("Reporte_Usuarios.pdf");
  };

  const styles = `
  :root{
    --bg-page:#eaf3fb; --bg-card:#ffffff;
    --primary:#0b5fff; --primary-600:#144fe8; --primary-50:#e8f0ff;
    --text:#0f172a; --muted:#6b7280; --success:#14b8a6;
    --radius:16px; --shadow:0 10px 30px rgba(15,23,42,.08);
    --shadow-soft:0 4px 14px rgba(15,23,42,.06);
  }
  *{ box-sizing:border-box }
  .page{ min-height:100dvh; background:
    radial-gradient(1200px 600px at 50% -100px, #dbeafe 0%, transparent 60%),
    var(--bg-page);
    padding:28px clamp(16px,3vw,40px); color:var(--text);
    font-family:"Inter", system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
  }
  .header{ display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:22px; }
  .title{ font-size:clamp(20px,2.2vw,28px); font-weight:800; letter-spacing:.2px; }
  .actions{ display:flex; gap:10px; }
  .btn{ appearance:none; border:0; border-radius:12px; padding:10px 14px; font-weight:600; cursor:pointer;
        display:inline-flex; align-items:center; gap:10px; box-shadow:var(--shadow-soft);
        transition:transform .08s ease, box-shadow .2s ease, background .2s ease; }
  .btn:active{ transform: translateY(1px) scale(.99); }
  .btn-primary{ background:var(--primary); color:#fff; }
  .btn-primary:hover{ background:var(--primary-600); }
  .btn-primary:focus-visible{ outline:3px solid var(--primary-50); outline-offset:2px; }
  .card{ background:var(--bg-card); border-radius:var(--radius); box-shadow:var(--shadow); padding:16px; }
  .subtle{ color:var(--muted); font-size:.95rem; }
  .badge{ display:inline-block; font-size:.8rem; padding:4px 10px; border-radius:999px; background:#ecfeff; color:var(--success); border:1px solid #c3f7f2; margin-left:6px; }
  .table-wrap{ margin-top:12px; border-radius:calc(var(--radius) - 6px); overflow:hidden; box-shadow:var(--shadow-soft); }
  .table{ width:100%; border-collapse:collapse; background:#fff; }
  .table thead th{ position:sticky; top:0; z-index:1; background:linear-gradient(180deg,#f6f9ff 0%, #eef4ff 100%);
    color:#1f2a44; text-align:left; padding:14px 16px; font-size:.92rem; letter-spacing:.3px; border-bottom:1px solid #e6eefc; }
  .table tbody td{ padding:12px 16px; border-bottom:1px solid #f1f5fb; font-size:.95rem; }
  .table tbody tr:nth-child(odd){ background:#fafcff; }
  .table tbody tr:hover{ background:#f0f6ff; }
  @media (max-width: 720px){
    .header{ flex-direction:column; align-items:flex-start; }
    .btn{ width:100%; justify-content:center; }
    .table thead{ display:none; }
    .table, .table tbody, .table tr, .table td{ display:block; width:100%; }
    .table tr{ padding:10px 12px; }
    .table td{ border:0; border-bottom:1px dashed #e6eefc; padding:10px 12px; }
    .table td::before{ content: attr(data-label); display:block; font-size:.78rem; color:var(--muted); margin-bottom:4px; }
  }`;

  return (
    <div className="page">
      <style>{styles}</style>
      <div className="header">
        <h1 className="title">Usuarios registrados</h1>
        <div className="actions">
          <button className="btn btn-primary" onClick={generarPDF}>
            Descargar PDF
          </button>
        </div>
      </div>
      <div className="card">
        <p className="subtle">
          Listado de cuentas activas <span className="badge">Activo</span>
        </p>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Correo</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.idUsuario}>
                  <td data-label="ID">{u.idUsuario}</td>
                  <td data-label="Nombre">{u.nombre}</td>
                  <td data-label="Apellido">{u.apellido}</td>
                  <td data-label="Correo">{u.correo}</td>
                  <td data-label="Rol">{u.id_rol}</td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={5} data-label="Estado">
                    Cargando usuarios…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsuariosPage;