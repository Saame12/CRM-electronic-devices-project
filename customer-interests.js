const Domain = require('./crm-domain');
async function ensureSchema(db) {
  await db.query(
    'CREATE TABLE IF NOT EXISTS interests (id VARCHAR(32) PRIMARY KEY,name VARCHAR(80) NOT NULL UNIQUE) ENGINE=InnoDB'
  );
  await db.query(
    'CREATE TABLE IF NOT EXISTS customer_interests (customer_id CHAR(36) NOT NULL,interest_id VARCHAR(32) NOT NULL,PRIMARY KEY(customer_id,interest_id),CONSTRAINT fk_interest_customer FOREIGN KEY(customer_id) REFERENCES users(id) ON DELETE CASCADE,CONSTRAINT fk_interest_catalog FOREIGN KEY(interest_id) REFERENCES interests(id)) ENGINE=InnoDB'
  );
  for (const item of Domain.interests)
    await db.execute(
      'INSERT INTO interests(id,name) VALUES (?,?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
      [item.id, item.name]
    );
}
async function attach(db, users) {
  if (!users.length) return users;
  const [rows] = await db.execute(
    'SELECT customer_id,interest_id FROM customer_interests WHERE customer_id IN (' +
      users.map(() => '?').join(',') +
      ') ORDER BY interest_id',
    users.map((u) => u.id)
  );
  for (const u of users)
    u.interests = rows.filter((r) => r.customer_id === u.id).map((r) => r.interest_id);
  return users;
}
async function save(db, id, interests) {
  if (interests === undefined) return;
  const ids = Domain.interestIds(interests);
  await db.execute('DELETE FROM customer_interests WHERE customer_id=?', [id]);
  for (const interest of ids)
    await db.execute('INSERT INTO customer_interests(customer_id,interest_id) VALUES (?,?)', [
      id,
      interest
    ]);
}
module.exports = { ensureSchema, attach, save };
