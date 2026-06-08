// ============================================================
// FITTRACK - Base de datos no relacional (MongoDB)
// Archivo de comandos para mongosh
// ============================================================

// ------------------------------------------------------------
// BLOQUE II - 1. CREACIÓN E INSERCIÓN DE DATOS
// ------------------------------------------------------------

// Seleccionar / crear la base de datos
use fittrack

// Insertar 5 entrenamientos con 2 atletas diferentes
db.entrenamientos.insertMany([
  {
    atleta: { nombre: "Carlos Martínez", edad: 28, email: "carlos@email.com" },
    entrenador: { nombre: "Laura Gómez", certificacion: "NSCA-CPT" },
    fecha: new Date("2024-06-01"),
    duracion_total_min: 75,
    tipo_sesion: "mixta",
    ejercicios: [
      { tipo: "fuerza", nombre: "Sentadilla",      series: 4, repeticiones: 10, peso_kg: 85 },
      { tipo: "fuerza", nombre: "Press de banca",  series: 3, repeticiones: 8,  peso_kg: 70 },
      { tipo: "cardio", nombre: "Carrera continua", distancia_km: 5, ritmo_min_km: 5.2 }
    ]
  },
  {
    atleta: { nombre: "Carlos Martínez", edad: 28, email: "carlos@email.com" },
    entrenador: { nombre: "Laura Gómez", certificacion: "NSCA-CPT" },
    fecha: new Date("2024-06-08"),
    duracion_total_min: 60,
    tipo_sesion: "fuerza",
    ejercicios: [
      { tipo: "fuerza", nombre: "Peso muerto",  series: 4, repeticiones: 6, peso_kg: 100 },
      { tipo: "fuerza", nombre: "Dominadas",    series: 3, repeticiones: 8, peso_kg: 20  }
    ]
  },
  {
    atleta: { nombre: "Carlos Martínez", edad: 28, email: "carlos@email.com" },
    entrenador: { nombre: "Laura Gómez", certificacion: "NSCA-CPT" },
    fecha: new Date("2024-05-25"),
    duracion_total_min: 45,
    tipo_sesion: "cardio",
    ejercicios: [
      { tipo: "cardio", nombre: "Carrera continua", distancia_km: 12, ritmo_min_km: 4.8 }
    ]
  },
  {
    atleta: { nombre: "Ana López", edad: 24, email: "ana@email.com" },
    entrenador: { nombre: "Laura Gómez", certificacion: "NSCA-CPT" },
    fecha: new Date("2024-06-03"),
    duracion_total_min: 50,
    tipo_sesion: "yoga",
    ejercicios: [
      { tipo: "yoga", nombre: "Saludo al sol",        duracion_min: 20, tipo_estiramiento: "dinámico" },
      { tipo: "yoga", nombre: "Postura del guerrero", duracion_min: 15, tipo_estiramiento: "estático" }
    ]
  },
  {
    atleta: { nombre: "Ana López", edad: 24, email: "ana@email.com" },
    entrenador: { nombre: "Laura Gómez", certificacion: "NSCA-CPT" },
    fecha: new Date("2024-06-10"),
    duracion_total_min: 90,
    tipo_sesion: "mixta",
    ejercicios: [
      { tipo: "fuerza", nombre: "Sentadilla",        series: 3, repeticiones: 12, peso_kg: 50 },
      { tipo: "cardio", nombre: "Bicicleta estática", distancia_km: 15, ritmo_min_km: 3.5 }
    ]
  }
])


// ------------------------------------------------------------
// BLOQUE II - 2a. ACTUALIZACIÓN
// ------------------------------------------------------------

// Modificar la duración de un entrenamiento con $set
db.entrenamientos.updateOne(
  { "atleta.nombre": "Carlos Martínez", fecha: new Date("2024-06-01") },
  { $set: { duracion_total_min: 80 } }
)

// Añadir un nuevo ejercicio a un entrenamiento existente con $push
db.entrenamientos.updateOne(
  { "atleta.nombre": "Ana López", fecha: new Date("2024-06-03") },
  {
    $push: {
      ejercicios: {
        tipo: "cardio",
        nombre: "Saltar a la comba",
        distancia_km: 0,
        ritmo_min_km: 0,
        duracion_min: 10
      }
    }
  }
)


// ------------------------------------------------------------
// BLOQUE II - 2b. ELIMINACIÓN
// ------------------------------------------------------------

// Insertar documento de prueba
db.entrenamientos.insertOne({
  atleta: { nombre: "Prueba Borrar", edad: 99, email: "prueba@test.com" },
  entrenador: { nombre: "Test" },
  fecha: new Date("2000-01-01"),
  duracion_total_min: 1,
  tipo_sesion: "prueba",
  ejercicios: []
})

// Eliminar el documento de prueba
db.entrenamientos.deleteOne(
  { "atleta.nombre": "Prueba Borrar" }
)


// ------------------------------------------------------------
// BLOQUE II - 3. CONSULTAS DE FILTRADO
// ------------------------------------------------------------

// Pantalla "Historial de atleta"
// Todos los entrenamientos de Carlos ordenados de más reciente a más antiguo
db.entrenamientos.find(
  { "atleta.nombre": "Carlos Martínez" }
).sort({ fecha: -1 })

// Pantalla "Alerta de esfuerzo"
// Entrenamientos con fuerza > 80kg O cardio > 10km
db.entrenamientos.find({
  $or: [
    { ejercicios: { $elemMatch: { tipo: "fuerza", peso_kg:      { $gt: 80 } } } },
    { ejercicios: { $elemMatch: { tipo: "cardio", distancia_km: { $gt: 10 } } } }
  ]
})


// ------------------------------------------------------------
// BLOQUE III - 1. INDEXACIÓN Y RENDIMIENTO
// ------------------------------------------------------------

// Análisis ANTES del índice (COLLSCAN - recorre todos los documentos)
db.entrenamientos.find(
  { "atleta.nombre": "Carlos Martínez" }
).explain("executionStats")

// Crear índice sobre el campo atleta.nombre
db.entrenamientos.createIndex({ "atleta.nombre": 1 })

// Análisis DESPUÉS del índice (IXSCAN - acceso directo por índice)
db.entrenamientos.find(
  { "atleta.nombre": "Carlos Martínez" }
).explain("executionStats")


// ------------------------------------------------------------
// BLOQUE III - 2. CUADRO DE MANDOS (AGGREGATION FRAMEWORK)
// ------------------------------------------------------------

// Resumen de rendimiento de Carlos Martínez:
// tiempo total entrenado, número de sesiones y duración media
db.entrenamientos.aggregate([
  // Paso 1: Filtrar solo los entrenamientos de Carlos
  {
    $match: { "atleta.nombre": "Carlos Martínez" }
  },
  // Paso 2: Calcular métricas agrupando todos sus entrenamientos
  {
    $group: {
      _id: "$atleta.nombre",
      tiempo_total_min:    { $sum: "$duracion_total_min" },
      numero_sesiones:     { $sum: 1 },
      duracion_media_min:  { $avg: "$duracion_total_min" }
    }
  },
  // Paso 3: Formatear el resultado final
  {
    $project: {
      _id: 0,
      atleta:             "$_id",
      tiempo_total_min:    1,
      numero_sesiones:     1,
      duracion_media_min: { $round: ["$duracion_media_min", 1] }
    }
  }
])
