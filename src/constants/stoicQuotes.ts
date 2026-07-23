export interface StoicQuote {
  id: number;
  quote: string;
  author: 'Marco Aurelio' | 'Séneca' | 'Epícteto' | 'Zenón de Citio' | 'Musonio Rufo';
  work?: string;
  category: 'Esfuerzo' | 'Disciplina' | 'Recuperación' | 'Enfoque' | 'Perseverancia';
}

export const STOIC_QUOTES: StoicQuote[] = [
  {
    id: 1,
    quote: "El obstáculo es el camino. Lo que se interpone en la acción contribuye a la acción.",
    author: "Marco Aurelio",
    work: "Meditaciones",
    category: "Perseverancia"
  },
  {
    id: 2,
    quote: "No nos atrevemos a muchas cosas porque son difíciles, pero son difíciles porque no nos atrevemos.",
    author: "Séneca",
    work: "Cartas a Lucilio",
    category: "Esfuerzo"
  },
  {
    id: 3,
    quote: "No es lo que te ocurre, sino cómo reaccionas a ello lo que importa.",
    author: "Epícteto",
    work: "Enquiridión",
    category: "Enfoque"
  },
  {
    id: 4,
    quote: "El descanso también forma parte del trabajo del atleta sabio. Restaura la mente y los músculos.",
    author: "Séneca",
    work: "Sobre la tranquilidad del ánimo",
    category: "Recuperación"
  },
  {
    id: 5,
    quote: "Tienes poder sobre tu mente, no sobre los acontecimientos. Date cuenta de esto y encontrarás la fuerza.",
    author: "Marco Aurelio",
    work: "Meditaciones",
    category: "Disciplina"
  },
  {
    id: 6,
    quote: "Ningún hombre es libre si no es dueño de sí mismo.",
    author: "Epícteto",
    work: "Discursos",
    category: "Disciplina"
  },
  {
    id: 7,
    quote: "Comienza de una vez a vivir y cuenta cada día como una vida diferente.",
    author: "Séneca",
    work: "Cartas a Lucilio",
    category: "Esfuerzo"
  },
  {
    id: 8,
    quote: "Si te afliges por algo externo, no es eso lo que te molesta, sino tu propio juicio sobre ello.",
    author: "Marco Aurelio",
    work: "Meditaciones",
    category: "Enfoque"
  },
  {
    id: 9,
    quote: "No hay viento favorable para el barco que no sabe adónde va.",
    author: "Séneca",
    work: "Cartas a Lucilio",
    category: "Enfoque"
  },
  {
    id: 10,
    quote: "Primero te dices a ti mismo lo que serías; luego haces lo que tienes que hacer.",
    author: "Epícteto",
    work: "Discursos",
    category: "Disciplina"
  },
  {
    id: 11,
    quote: "La riqueza no consiste en tener grandes posesiones, sino en tener pocas necesidades.",
    author: "Epícteto",
    work: "Fragmentos",
    category: "Enfoque"
  },
  {
    id: 12,
    quote: "La suerte es lo que ocurre cuando la preparación se encuentra con la oportunidad.",
    author: "Séneca",
    work: "Cartas a Lucilio",
    category: "Esfuerzo"
  },
  {
    id: 13,
    quote: "Realiza cada acto de tu vida como si fuera el último.",
    author: "Marco Aurelio",
    work: "Meditaciones",
    category: "Disciplina"
  },
  {
    id: 14,
    quote: "El cuerpo debe ser tratado con rigor para que no sea desobediente al espíritu.",
    author: "Séneca",
    work: "Cartas a Lucilio",
    category: "Esfuerzo"
  },
  {
    id: 15,
    quote: "La dificultad muestra lo que son los hombres.",
    author: "Epícteto",
    work: "Discursos",
    category: "Perseverancia"
  },
  {
    id: 16,
    quote: "No pierdas más tiempo discutiendo lo que debe ser un buen hombre. Sé uno.",
    author: "Marco Aurelio",
    work: "Meditaciones",
    category: "Disciplina"
  },
  {
    id: 17,
    quote: "Largo es el camino de los preceptos, breve y eficaz el de los ejemplos.",
    author: "Séneca",
    work: "Cartas a Lucilio",
    category: "Disciplina"
  },
  {
    id: 18,
    quote: "No te entregues al sueño antes de haber repasado tres veces las acciones del día.",
    author: "Epícteto",
    work: "Fragmentos",
    category: "Recuperación"
  },
  {
    id: 19,
    quote: "El alma se tiñe del color de sus pensamientos.",
    author: "Marco Aurelio",
    work: "Meditaciones",
    category: "Enfoque"
  },
  {
    id: 20,
    quote: "Te volverás fuerte soportando las adversidades y no eludiéndolas.",
    author: "Musonio Rufo",
    work: "Disertaciones",
    category: "Perseverancia"
  },
  {
    id: 21,
    quote: "El hombre que sufre antes de que sea necesario, sufre más de lo necesario.",
    author: "Séneca",
    work: "Cartas a Lucilio",
    category: "Enfoque"
  },
  {
    id: 22,
    quote: "Cuanto mayor es la dificultad, mayor es la gloria en superarla.",
    author: "Epícteto",
    work: "Discursos",
    category: "Perseverancia"
  },
  {
    id: 23,
    quote: "La mejor venganza es no parecerse a quien causó el daño.",
    author: "Marco Aurelio",
    work: "Meditaciones",
    category: "Disciplina"
  },
  {
    id: 24,
    quote: "La serenidad es el resultado del control sobre los deseos y del trabajo firme sobre uno mismo.",
    author: "Zenón de Citio",
    work: "Sentencias",
    category: "Enfoque"
  },
];

/**
 * Retorna la frase del día calculada algorítmicamente por la fecha actual.
 */
export function getDailyStoicQuote(): StoicQuote {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const index = dayOfYear % STOIC_QUOTES.length;
  return STOIC_QUOTES[index];
}

/**
 * Retorna una frase aleatoria garantizando que no sea la actual.
 */
export function getRandomStoicQuote(currentId?: number): StoicQuote {
  const pool = STOIC_QUOTES.filter((q) => q.id !== currentId);
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex] || STOIC_QUOTES[0];
}
