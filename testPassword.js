const bcrypt = require('bcrypt');

async function testPassword(attempt) {
  const hash = '$2b$10$eq1C1MzBj2Wypi9qUOXlyOqmPSS5nftBM4JAO9mAsE/1lrXGLjSdy';
  const isMatch = await bcrypt.compare(attempt, hash);
  
  console.log(`Test avec "${attempt}": ${isMatch ? '✅ OK' : '❌ Incorrect'}`);
  return isMatch;
}

// Testez plusieurs valeurs
(async () => {
  await testPassword('1');      // Devrait être vrai
  await testPassword('123');    // Devrait être faux
  await testPassword(' ');      // Espace
  await testPassword('1 ');     // Espace après
})();