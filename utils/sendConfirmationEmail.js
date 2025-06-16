const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");

const sendConfirmationEmail = async ({
  to,
  name,
  phone,
  date,
  time,
  people,
  paymentId,
  rafts = []
}) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "shahalmunderi@gmail.com",
        pass: "mecuxzytfqbwuawi"
      }
    });

    const generatePDFBuffer = () => {
      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50
        });

        const buffers = [];
        doc.on("data", (chunk) => buffers.push(chunk));
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(buffers);

          // Optional: Save locally for testing
          fs.writeFileSync(`Invoice_${name.replace(/\s+/g, '_')}_${date}.pdf`, pdfBuffer);

          resolve(pdfBuffer);
        });
        doc.on("error", reject);

        // ---------- PDF CONTENT ----------
        doc.fillColor("#0e76a8").fontSize(22).text("Kannur River Rafting - Booking Invoice", {
          align: "center",
          underline: true
        });

        doc.moveDown(2);
        doc.fontSize(14).fillColor("black");

        doc.text(`Name: ${name}`);
        doc.text(`Phone: ${phone}`);
        doc.text(`Date: ${date}`);
        doc.text(`Time: ${time}`);
        doc.text(`People: ${people}`);

        doc.moveDown();
        doc.fontSize(14).fillColor("green").text(`Amount Paid: Rs. 1000`);
        doc.fontSize(13).fillColor("black").text(`Payment ID: ${paymentId}`);
        doc.text(`Status: Paid`);

        if (rafts.length > 0) {
          doc.moveDown();
          doc.fontSize(13).fillColor("black").text("Rafts Assigned:", { underline: true });
          rafts.forEach(r => {
            doc.text(`• Raft ${r.raftId} — ${r.booked} seat${r.booked > 1 ? "s" : ""}`);
          });
        }

        doc.moveDown(2);
        doc.fontSize(11).fillColor("#555").text("Please arrive 15 minutes early. Carry this invoice for verification.", {
  align: 'center'
});

        doc.text("Location: Kannur River Rafting Base Camp", {
          align: "center"
        });

        doc.end();
      });
    };

    const pdfBuffer = await generatePDFBuffer();

    const mailOptions = {
      from: '"Kannur River Rafting" <shahalmunderi@gmail.com>',
      to,
      subject: "Your Rafting Booking Confirmation",
      html: `
        <h2>✅ Booking Confirmed!</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your river rafting booking is confirmed. Here are your details:</p>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Phone:</strong> ${phone}</li>
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Time:</strong> ${time}</li>
          <li><strong>People:</strong> ${people}</li>
          <li><strong>Payment ID:</strong> ${paymentId}</li>
        </ul>
        <p>We’ve attached your invoice below. Please arrive 15 minutes early. 🌊</p>
        <p>Thank you for choosing <strong>Kannur River Rafting</strong>!</p>
      `,
      attachments: [
        {
          filename: `Invoice_${name.replace(/\s+/g, '_')}_${date}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email with PDF invoice sent successfully!");
  } catch (err) {
    console.error("❌ Failed to send email:", err.message);
  }
};

module.exports = sendConfirmationEmail;
