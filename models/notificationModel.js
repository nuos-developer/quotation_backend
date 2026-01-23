const { pool } = require('../config/dbConn');

const notificationModel = {

insertEmailbyUserId: async (
  userEmail,
  subject,
  emailHtml,
  userId,
  notificationType
) => {
  try {

    const query = `
      INSERT INTO notifications (
        user_id,
        user_email,
        subject,
        html,
        is_approved,
        is_read,
        status,
        created_by,
        notification_type
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING id;
    `;

    const values = [
      userId,            // $1 user_id
      userEmail,         // $2 user_email
      subject,           // $3 subject
      emailHtml,         // $4 html
      false,             // $5 is_approved
      false,             // $6 is_read
      'PENDING',         // $7 status
      userId,            // $8 created_by
      notificationType   // $9 notification_type
    ];

    const result = await pool.query(query, values);
    return result.rows[0];

  } catch (error) {
    console.error('Error inserting notification:', error);
    throw error;
  }
}


}


module.exports  = {notificationModel}