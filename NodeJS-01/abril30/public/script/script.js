function mostrarDatos() {
    const email = document.getElementById('usr').value;
    const contraseña = document.getElementById('pass').value;
    
    // Mostrar los valores en una alerta
    alert(`Email: ${email}\nContraseña: ${contraseña}`);
}
