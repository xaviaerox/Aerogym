export const BASE_EXERCISES_DETAILS: Record<string, { id: string; name: string; muscleGroup: string; type: string; category: string; mechanic: string; force: string; steps: string[]; mediaId: string | null }> = {
  "bench-press": {
    "id": "bench-press",
    "name": "Press de Banca",
    "muscleGroup": "Pecho",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Push",
    "steps": [
      "Túmbate sobre un banco con los pies apoyados en el suelo y la espalda presionada contra el banco.",
      "Agarra la barra con un agarre pronado un poco más ancho que la separación de los hombros.",
      "Levanta la barra del soporte y sostenla directamente sobre el pecho con los brazos completamente extendidos.",
      "Baja la barra lentamente hacia el pecho, manteniendo los codos pegados al cuerpo.",
      "Haz una pausa breve cuando la barra toque el pecho.",
      "Empuja la barra de vuelta a la posición inicial extendiendo los brazos.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0025-EIeI8Vf"
  },
  "incline-bb-press": {
    "id": "incline-bb-press",
    "name": "Press Inclinado con Barra",
    "muscleGroup": "Pecho",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Push",
    "steps": [
      "Coloca un banco inclinado a un ángulo de 45 grados.",
      "Túmbate en el banco con los pies planos sobre el suelo.",
      "Agarra la barra con un agarre pronado un poco más ancho que la separación de los hombros.",
      "Saca la barra del soporte y bájala lentamente hacia el pecho, manteniendo los codos a un ángulo de 45 grados.",
      "Haz una pausa breve en la parte baja y luego empuja la barra de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0047-3TZduzM"
  },
  "incline-db-press": {
    "id": "incline-db-press",
    "name": "Press Superior con Mancuernas",
    "muscleGroup": "Pecho",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Push",
    "steps": [
      "Siéntate en un banco inclinado con una mancuerna en cada mano, apoyadas sobre los muslos.",
      "Recuéstate en el banco y usa los muslos para ayudar a levantar las mancuernas hasta la altura de los hombros, con las palmas hacia adelante.",
      "Una vez a la altura de los hombros, gira las muñecas de modo que las palmas de las manos queden mirando hacia adelante.",
      "Empuja las mancuernas hacia arriba con el pecho y los hombros, extendiendo completamente los brazos.",
      "Baja las mancuernas de nuevo hasta la posición inicial, manteniendo los codos ligeramente flexionados.",
      "Repite el número de repeticiones deseado, alternando los brazos."
    ],
    "mediaId": "3545-TVdivgY"
  },
  "chest-machine-press": {
    "id": "chest-machine-press",
    "name": "Máquina de Pecho",
    "muscleGroup": "Pecho",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Push",
    "steps": [
      "Sujeta la banda a un punto de anclaje resistente a la altura del pecho.",
      "Ponte de pie con el costado hacia el punto de anclaje y agarra la banda con una mano.",
      "Aléjate del punto de anclaje para generar tensión en la banda.",
      "Coloca los pies separados a la altura de los hombros y flexiona ligeramente las rodillas.",
      "Lleva la mano que sostiene la banda a través del cuerpo, hacia el hombro opuesto.",
      "Manteniendo la tensión en la banda, empuja la mano hacia adelante y alejándola del cuerpo, extendiendo el brazo.",
      "Regresa lentamente a la posición inicial y repite el número de repeticiones deseado.",
      "Cambia de lado y repite el ejercicio con la otra mano."
    ],
    "mediaId": "0989-c16nYGA"
  },
  "pec-dec": {
    "id": "pec-dec",
    "name": "Pec Deck / Aperturas",
    "muscleGroup": "Pecho",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Push",
    "steps": [
      "Siéntate en el suelo con las piernas extendidas frente a ti.",
      "Flexiona las rodillas y junta las plantas de los pies, dejando que las rodillas caigan hacia los lados.",
      "Sujétate los tobillos o los pies con las manos.",
      "Siéntate erguido y alarga la columna.",
      "Presiona suavemente las rodillas hacia el suelo, sintiendo un estiramiento en la parte interna de los muslos.",
      "Mantén esta posición durante unas cuantas respiraciones.",
      "Para liberar, lleva lentamente las rodillas hacia arriba de nuevo y extiende las piernas."
    ],
    "mediaId": "1494-bWlZvXh"
  },
  "dips": {
    "id": "dips",
    "name": "Fondos en Paralelas",
    "muscleGroup": "Pecho",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Push",
    "steps": [
      "Siéntate en el borde de un banco o silla con las manos sujetando el borde junto a las caderas.",
      "Desliza las caderas hacia adelante, fuera del banco, y estira las piernas, manteniendo los talones en el suelo.",
      "Flexiona los codos y baja el cuerpo hacia el suelo, manteniendo la espalda cerca del banco.",
      "Haz una pausa por un momento en la posición más baja, luego empuja con las manos para enderezar los brazos y levantar el cuerpo de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "3287-LkoAWAE"
  },
  "cable-flyes": {
    "id": "cable-flyes",
    "name": "Cruces en Polea",
    "muscleGroup": "Pecho",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Push",
    "steps": [
      "Coloca una agarradera en D en cada cable de polea baja y ponte de pie en el centro de la máquina de cable cruzado.",
      "Sujeta las agarraderas con agarre prono (palmas hacia abajo) y da un paso hacia adelante, colocando los pies separados a la altura de los hombros.",
      "Flexiona ligeramente las rodillas e inclínate hacia adelante desde la cintura, manteniendo la espalda recta y el abdomen activado.",
      "Con los brazos extendidos hacia los lados y ligeramente flexionados en los codos, exhala y junta los omóplatos mientras tiras de los cables hacia atrás y hacia arriba en un movimiento de apertura inversa.",
      "Haz una pausa breve en el punto máximo de contracción, luego inhala y vuelve lentamente a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0154-aqvSOQE"
  },
  "decline-bb-press": {
    "id": "decline-bb-press",
    "name": "Press Declinado con Barra",
    "muscleGroup": "Pecho",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Push",
    "steps": [
      "Túmbate en un banco declinado con los pies sujetos y la cabeza más baja que las caderas.",
      "Agarra la barra con un agarre pronado un poco más ancho que la separación de los hombros.",
      "Saca la barra del soporte y bájala lentamente hacia el pecho, manteniendo los codos pegados al cuerpo.",
      "Haz una pausa breve en la parte baja y luego empuja la barra de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0033-GrO65fd"
  },
  "smith-incline-press": {
    "id": "smith-incline-press",
    "name": "Press Inclinado en Multipower",
    "muscleGroup": "Pecho",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Push",
    "steps": [
      "Ajusta el banco a una inclinación de 30-45 grados.",
      "Siéntate en el banco con la espalda plana contra la almohadilla y los pies firmemente apoyados en el suelo.",
      "Agarra la barra con un agarre pronado un poco más ancho que la separación de los hombros.",
      "Suelta la barra y bájala lentamente hacia la parte alta del pecho, manteniendo los codos ligeramente pegados al cuerpo.",
      "Haz una pausa por un momento en la posición baja, luego empuja la barra de vuelta a la posición inicial, extendiendo los brazos por completo.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0757-5v7KYld"
  },
  "incline-db-flyes": {
    "id": "incline-db-flyes",
    "name": "Aperturas Inclinadas con Mancuernas",
    "muscleGroup": "Pecho",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Push",
    "steps": [
      "Ajusta un banco inclinado a un ángulo de 45 grados.",
      "Siéntate en el banco con una mancuerna en cada mano, con las palmas enfrentadas entre sí.",
      "Recuéstate en el banco y empuja las mancuernas hacia arriba hasta la posición inicial, directamente por encima del pecho.",
      "Baja las mancuernas hacia los lados describiendo un amplio arco hasta sentir un estiramiento en el pecho.",
      "Haz una pausa por un momento, luego contrae los músculos del pecho para llevar las mancuernas de nuevo hacia arriba hasta la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0319-ESOd5Pl"
  },
  "lat-pulldown": {
    "id": "lat-pulldown",
    "name": "Jalón al Pecho",
    "muscleGroup": "Espalda",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Siéntate en la máquina de cable con la espalda recta y los pies apoyados en el suelo.",
      "Agarra las agarraderas con un agarre prono, un poco más separadas que el ancho de los hombros.",
      "Inclínate ligeramente hacia atrás y lleva las agarraderas hacia el pecho, juntando los omóplatos.",
      "Haz una pausa por un momento en el punto máximo del movimiento, luego suelta lentamente las agarraderas de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0007-4IKbhHV"
  },
  "hammer-row": {
    "id": "hammer-row",
    "name": "Remo Hammer",
    "muscleGroup": "Espalda",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Cuélgate de una barra de dominadas con los brazos completamente extendidos y las palmas mirando hacia afuera.",
      "Activa el core y levanta las rodillas hacia el pecho, manteniendo las piernas juntas.",
      "Una vez que las rodillas estén a la altura del pecho, lanza las piernas explosivamente hacia el suelo, extendiéndolas por completo.",
      "Deja que las piernas se balanceen de vuelta hacia arriba y repite el movimiento el número de repeticiones deseado."
    ],
    "mediaId": "0010-8K0w2yA"
  },
  "chest-supported-row": {
    "id": "chest-supported-row",
    "name": "Remo Soporte Pecho",
    "muscleGroup": "Espalda",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Cuélgate de una barra de dominadas con los brazos completamente extendidos y las palmas mirando hacia afuera.",
      "Activa el core y levanta las rodillas hacia el pecho, manteniendo las piernas juntas.",
      "Una vez que las rodillas estén a la altura del pecho, lanza las piernas explosivamente hacia el suelo, extendiéndolas por completo.",
      "Deja que las piernas se balanceen de vuelta hacia arriba y repite el movimiento el número de repeticiones deseado."
    ],
    "mediaId": "0010-8K0w2yA"
  },
  "seated-row": {
    "id": "seated-row",
    "name": "Remo en Polea Baja",
    "muscleGroup": "Espalda",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Siéntate en un banco o silla con los pies apoyados en el suelo y la espalda recta.",
      "Sostén la banda con una mano y extiende el brazo completamente frente a ti.",
      "Manteniendo la espalda recta, tira de la banda hacia el cuerpo flexionando el codo y juntando los omóplatos.",
      "Al mismo tiempo, gira el torso hacia el lado del brazo que tira.",
      "Haz una pausa por un momento en la parte superior, luego suelta lentamente la tensión de la banda y regresa a la posición inicial.",
      "Repite el número de repeticiones deseado, luego cambia al otro brazo."
    ],
    "mediaId": "0990-DKBwJrL"
  },
  "db-rows": {
    "id": "db-rows",
    "name": "Remo con Mancuerna",
    "muscleGroup": "Espalda",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Ponte de pie con los pies separados a la altura de los hombros, las rodillas ligeramente flexionadas, y sujeta una mancuerna en cada mano con las palmas hacia tu cuerpo.",
      "Inclínate hacia adelante desde las caderas, manteniendo la espalda recta y el core activado.",
      "Deja que los brazos cuelguen rectos hacia el suelo, con los codos ligeramente flexionados.",
      "Tira de las mancuernas hacia arriba, hacia el pecho, apretando los omóplatos entre sí.",
      "Haz una pausa breve en la parte alta, luego baja lentamente las mancuernas de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0293-BJ0Hz5L"
  },
  "pullups": {
    "id": "pullups",
    "name": "Dominadas",
    "muscleGroup": "Espalda",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Ajusta la máquina al peso y la altura deseados.",
      "Coloca las manos en las barras paralelas con un agarre cerrado, con las palmas mirándose entre sí.",
      "Cuélgate de las barras con los brazos completamente extendidos y los pies sin tocar el suelo.",
      "Activa los músculos de la espalda y lleva el cuerpo hacia arriba hacia las barras, manteniendo los codos cerca del cuerpo.",
      "Continúa subiendo hasta que la barbilla quede por encima de las barras.",
      "Haz una pausa por un momento en la parte superior, luego baja lentamente el cuerpo de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0015-vrhHa6D"
  },
  "chinups": {
    "id": "chinups",
    "name": "Dominadas Supinas",
    "muscleGroup": "Espalda",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Ajusta la máquina al nivel de asistencia deseado.",
      "Sube a la plataforma para los pies y agarra las agarraderas con un agarre prono, un poco más separadas que el ancho de los hombros.",
      "Mantén el pecho arriba y los hombros atrás, activa el core y flexiona ligeramente las rodillas.",
      "Levanta el cuerpo flexionando los codos y llevándolos hacia abajo, en dirección a los costados.",
      "Continúa subiendo hasta que la barbilla quede por encima de la barra.",
      "Haz una pausa por un momento en la parte superior, luego baja lentamente el cuerpo de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "1431-7OeHptV"
  },
  "deadlift": {
    "id": "deadlift",
    "name": "Peso Muerto Convencional",
    "muscleGroup": "Espalda",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Ponte de pie con los pies separados a la altura de los hombros y coloca la banda alrededor de los tobillos.",
      "Sujeta la banda con ambas manos frente a los muslos, con las palmas mirando hacia el cuerpo.",
      "Manteniendo la espalda recta y el core activado, flexiona las caderas y baja lentamente la parte superior del cuerpo hacia el suelo.",
      "Mientras bajas, empuja las caderas hacia atrás y deja que las rodillas se flexionen ligeramente.",
      "Baja la banda hacia el suelo, sintiendo un estiramiento en los isquiotibiales.",
      "Haz una pausa breve en la posición baja, luego activa los glúteos y los isquiotibiales para levantar la parte superior del cuerpo de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "1009-kuMiR2T"
  },
  "cable-pullover": {
    "id": "cable-pullover",
    "name": "Pullover en Polea",
    "muscleGroup": "Espalda",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Túmbate boca arriba en un banco con la cabeza en un extremo y los pies en el suelo.",
      "Sujeta una barra con un agarre a la altura de los hombros y extiende los brazos rectos por encima del pecho.",
      "Baja la barra detrás de la cabeza manteniendo los brazos ligeramente flexionados.",
      "Haz una pausa breve y luego levanta la barra de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "1316-cA9FuWG"
  },
  "db-pullover": {
    "id": "db-pullover",
    "name": "Pullover con Mancuerna",
    "muscleGroup": "Espalda",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Túmbate en un banco con la cabeza en un extremo y los pies firmemente apoyados en el suelo.",
      "Sujeta una mancuerna con ambas manos y extiende los brazos rectos por encima del pecho.",
      "Manteniendo los brazos rectos, baja lentamente la mancuerna detrás de la cabeza en un movimiento de arco.",
      "Haz una pausa breve en la parte baja, luego levanta la mancuerna de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0288-vi8EhoE"
  },
  "hyperextensions": {
    "id": "hyperextensions",
    "name": "Hiperextensiones Lumbares",
    "muscleGroup": "Espalda",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Ajusta el banco de hiperextensiones para que la parte superior de los muslos quede apoyada en la almohadilla y los pies queden asegurados.",
      "Cruza los brazos sobre el pecho o coloca las manos detrás de la cabeza.",
      "Baja la parte superior del cuerpo hacia el suelo manteniendo la espalda recta.",
      "Haz una pausa breve en la parte baja, luego eleva la parte superior del cuerpo hasta que quede alineada con las piernas.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0489-zhMwOwE"
  },
  "t-bar-row": {
    "id": "t-bar-row",
    "name": "Remo en Punta (T-Bar)",
    "muscleGroup": "Espalda",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Ajusta la altura del asiento y la posición de la placa para los pies en la máquina de palanca.",
      "Siéntate en la máquina con el pecho contra la almohadilla y los pies planos sobre la placa para los pies.",
      "Agarra las agarraderas con un agarre prono, un poco más separadas que el ancho de los hombros.",
      "Mantén la espalda recta y activa el core.",
      "Tira de las asas hacia el pecho, juntando los omóplatos.",
      "Haz una pausa breve en la parte alta del movimiento, luego suelta lentamente y extiende los brazos de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "1349-BgljGjd"
  },
  "close-grip-pulldown": {
    "id": "close-grip-pulldown",
    "name": "Jalón Agrego Cerrado",
    "muscleGroup": "Espalda",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Siéntate en la máquina de cable con la espalda recta y los pies apoyados en el suelo.",
      "Agarra las agarraderas con un agarre prono, un poco más separadas que el ancho de los hombros.",
      "Inclínate ligeramente hacia atrás y lleva las agarraderas hacia el pecho, juntando los omóplatos.",
      "Haz una pausa por un momento en el punto máximo del movimiento, luego suelta lentamente las agarraderas de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0007-4IKbhHV"
  },
  "unilateral-cable-row": {
    "id": "unilateral-cable-row",
    "name": "Remo Unilateral en Polea",
    "muscleGroup": "Espalda",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Siéntate en el banco declinado frente a la máquina de cable con los pies firmemente colocados en los reposapiés.",
      "Sujeta el accesorio del cable con un agarre prono amplio, palmas hacia abajo.",
      "Inclínate ligeramente hacia atrás, manteniendo la espalda recta y el core activado.",
      "Tira del cable hacia la parte inferior del pecho, juntando los omóplatos.",
      "Haz una pausa breve en el punto máximo de la contracción, luego suelta lentamente el cable de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0159-kesXOpB"
  },
  "squats": {
    "id": "squats",
    "name": "Sentadilla con Barra",
    "muscleGroup": "Cuádriceps",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Push",
    "steps": [
      "Ponte de pie con los pies separados a la altura de las caderas y coloca una banda elástica alrededor de los tobillos.",
      "Extiende una pierna hacia adelante y apoya la parte superior del pie sobre un banco o escalón detrás de ti.",
      "Sujétate de un apoyo con una mano para mantener el equilibrio.",
      "Flexiona la pierna de apoyo y baja el cuerpo hacia una posición de sentadilla, manteniendo la rodilla alineada con los dedos del pie.",
      "Empuja con el talón para regresar a la posición inicial.",
      "Repite el número de repeticiones deseado, luego cambia de pierna."
    ],
    "mediaId": "0987-arsYEd3"
  },
  "leg-press-45": {
    "id": "leg-press-45",
    "name": "Prensa 45º",
    "muscleGroup": "Cuádriceps",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Push",
    "steps": [
      "Ajusta el asiento y la plataforma para los pies de la máquina de palanca a la posición deseada.",
      "Siéntate en la máquina con la espalda apoyada en el respaldo y los pies sobre la plataforma para los pies.",
      "Coloca las manos en las asas o en los lados de la máquina para mayor estabilidad.",
      "Empuja un pie contra la plataforma para los pies, extendiendo la pierna hasta que esté casi completamente recta.",
      "Haz una pausa breve, luego flexiona lentamente la pierna y vuelve a la posición inicial.",
      "Repite con la otra pierna.",
      "Continúa alternando las piernas durante el número de repeticiones deseado."
    ],
    "mediaId": "2287-V07qpXy"
  },
  "leg-press-light": {
    "id": "leg-press-light",
    "name": "Prensa Ligera",
    "muscleGroup": "Cuádriceps",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Push",
    "steps": [
      "Ajusta el asiento y la plataforma para los pies de la máquina de palanca a la posición deseada.",
      "Siéntate en la máquina con la espalda apoyada en el respaldo y los pies sobre la plataforma para los pies.",
      "Coloca las manos en las asas o en los lados de la máquina para mayor estabilidad.",
      "Empuja un pie contra la plataforma para los pies, extendiendo la pierna hasta que esté casi completamente recta.",
      "Haz una pausa breve, luego flexiona lentamente la pierna y vuelve a la posición inicial.",
      "Repite con la otra pierna.",
      "Continúa alternando las piernas durante el número de repeticiones deseado."
    ],
    "mediaId": "2287-V07qpXy"
  },
  "leg-extensions": {
    "id": "leg-extensions",
    "name": "Extensiones de Cuádriceps",
    "muscleGroup": "Cuádriceps",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Push",
    "steps": [
      "Ajusta la altura del asiento y el respaldo de la máquina a tu cuerpo.",
      "Siéntate en la máquina con la espalda apoyada en el respaldo y los pies sobre la almohadilla para los pies.",
      "Sujeta las asas o las barras laterales para mayor estabilidad.",
      "Extiende las piernas hacia adelante enderezando las rodillas, levantando el peso.",
      "Haz una pausa breve en lo alto, luego baja lentamente el peso de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0585-my33uHU"
  },
  "lunges": {
    "id": "lunges",
    "name": "Zancadas",
    "muscleGroup": "Cuádriceps",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Push",
    "steps": [
      "Ponte de pie con los pies separados a la altura de los hombros, sujetando una barra sobre la parte superior de la espalda.",
      "Da un paso grande hacia el lado con el pie derecho, manteniendo el pie izquierdo fijo en el suelo.",
      "Flexiona la rodilla derecha y baja el cuerpo hacia una posición de zancada, manteniendo la pierna izquierda recta.",
      "Empuja con el pie derecho y vuelve a la posición inicial.",
      "Repite hacia el otro lado, dando el paso con el pie izquierdo."
    ],
    "mediaId": "1410-py1HSzx"
  },
  "bulgarian-split-squat": {
    "id": "bulgarian-split-squat",
    "name": "Sentadilla Búlgara",
    "muscleGroup": "Cuádriceps",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Push",
    "steps": [
      "Ponte de pie con los pies separados a la altura de las caderas y coloca una banda elástica alrededor de los tobillos.",
      "Extiende una pierna hacia adelante y apoya la parte superior del pie sobre un banco o escalón detrás de ti.",
      "Sujétate de un apoyo con una mano para mantener el equilibrio.",
      "Flexiona la pierna de apoyo y baja el cuerpo hacia una posición de sentadilla, manteniendo la rodilla alineada con los dedos del pie.",
      "Empuja con el talón para regresar a la posición inicial.",
      "Repite el número de repeticiones deseado, luego cambia de pierna."
    ],
    "mediaId": "0987-arsYEd3"
  },
  "hack-squat": {
    "id": "hack-squat",
    "name": "Sentadilla Hack",
    "muscleGroup": "Cuádriceps",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Push",
    "steps": [
      "Empieza de pie con los pies separados a la altura de los hombros y los dedos de los pies ligeramente hacia afuera.",
      "Sujeta la barra detrás de las piernas, apoyándola en la parte superior de los muslos.",
      "Baja el cuerpo flexionando las rodillas y las caderas, manteniendo la espalda recta y el pecho elevado.",
      "Continúa bajando hasta que los muslos queden paralelos al suelo, o tan abajo como puedas hacerlo cómodamente.",
      "Haz una pausa breve y luego empuja con los talones para volver a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0046-5VCj6iH"
  },
  "goblet-squat": {
    "id": "goblet-squat",
    "name": "Sentadilla Goblet",
    "muscleGroup": "Cuádriceps",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Push",
    "steps": [
      "Ponte de pie con los pies separados a la altura de los hombros, sosteniendo una mancuerna verticalmente contra el pecho con ambas manos.",
      "Manteniendo el pecho erguido y el core activado, baja el cuerpo a una posición de sentadilla empujando las caderas hacia atrás y flexionando las rodillas.",
      "Continúa bajando hasta que los muslos queden paralelos al suelo, o tan abajo como puedas hacerlo cómodamente.",
      "Haz una pausa por un momento en la parte inferior, luego empuja con los talones para regresar a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "1760-yn8yg1r"
  },
  "front-squat": {
    "id": "front-squat",
    "name": "Sentadilla Frontal",
    "muscleGroup": "Cuádriceps",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Push",
    "steps": [
      "Empieza de pie con los pies separados a la altura de los hombros y la barra apoyada en la parte superior del pecho, justo debajo de la clavícula.",
      "Sujeta la barra con un agarre pronado, manteniendo los codos elevados y los brazos superiores paralelos al suelo.",
      "Baja el cuerpo hacia una posición de sentadilla flexionando las rodillas y las caderas, manteniendo la espalda recta y el pecho elevado.",
      "Haz una pausa breve en la parte baja de la sentadilla y luego empuja con los talones para volver a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0024-Y7YcmIJ"
  },
  "reverse-lunges": {
    "id": "reverse-lunges",
    "name": "Zancadas Inversas",
    "muscleGroup": "Cuádriceps",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Push",
    "steps": [
      "Ponte de pie con los pies separados a la altura de los hombros, sujetando una barra sobre la parte superior de la espalda.",
      "Da un paso grande hacia el lado con el pie derecho, manteniendo el pie izquierdo fijo en el suelo.",
      "Flexiona la rodilla derecha y baja el cuerpo hacia una posición de zancada, manteniendo la pierna izquierda recta.",
      "Empuja con el pie derecho y vuelve a la posición inicial.",
      "Repite hacia el otro lado, dando el paso con el pie izquierdo."
    ],
    "mediaId": "1410-py1HSzx"
  },
  "sissy-squat": {
    "id": "sissy-squat",
    "name": "Sentadilla Sissy",
    "muscleGroup": "Cuádriceps",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Push",
    "steps": [
      "Ponte de pie con los pies separados a la altura de los hombros y los dedos de los pies ligeramente hacia afuera.",
      "Sujétate de un objeto estable para mantener el equilibrio si es necesario.",
      "Baja lentamente el cuerpo doblando las rodillas e inclinándote hacia atrás, manteniendo el torso erguido.",
      "Continúa bajando hasta que los muslos queden paralelos al suelo o tan lejos como puedas llegar cómodamente.",
      "Haz una pausa breve y luego empuja con los talones para volver a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "1489-xdYPUtE"
  },
  "single-leg-extension": {
    "id": "single-leg-extension",
    "name": "Extensiones Unilaterales de Cuádriceps",
    "muscleGroup": "Cuádriceps",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Push",
    "steps": [
      "Ajusta la altura del asiento y el respaldo de la máquina a tu cuerpo.",
      "Siéntate en la máquina con la espalda apoyada en el respaldo y los pies sobre la almohadilla para los pies.",
      "Sujeta las asas o las barras laterales para mayor estabilidad.",
      "Extiende las piernas hacia adelante enderezando las rodillas, levantando el peso.",
      "Haz una pausa breve en lo alto, luego baja lentamente el peso de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0585-my33uHU"
  },
  "romanian-deadlift": {
    "id": "romanian-deadlift",
    "name": "Peso Muerto Rumano",
    "muscleGroup": "Isquios",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Ponte de pie con los pies separados a la altura de los hombros y los dedos de los pies apuntando hacia delante.",
      "Sujeta la barra con un agarre pronado, manos un poco más separadas que el ancho de los hombros.",
      "Flexiona las caderas, manteniendo la espalda recta y las rodillas ligeramente flexionadas.",
      "Baja la barra hacia el suelo, manteniéndola cerca del cuerpo.",
      "Siente el estiramiento en los isquiotibiales mientras bajas la barra.",
      "Cuando sientas el estiramiento en los isquiotibiales, empuja las caderas hacia delante y ponte de pie.",
      "Aprieta los glúteos en la parte alta del movimiento.",
      "Baja la barra de vuelta a la posición inicial y repite el número de repeticiones deseado."
    ],
    "mediaId": "0085-wQ2c4XD"
  },
  "leg-curls": {
    "id": "leg-curls",
    "name": "Curl Femoral Tumbado",
    "muscleGroup": "Isquios",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Ajusta la máquina de cable de modo que el accesorio para el tobillo quede en la posición más baja.",
      "Túmbate boca abajo en el banco con las piernas rectas y el accesorio para el tobillo sujeto a los tobillos.",
      "Sujétate de las agarraderas del banco para mantener la estabilidad.",
      "Manteniendo quieta la parte superior del cuerpo, exhala y flexiona las piernas hacia los glúteos doblando las rodillas.",
      "Haz una pausa breve en la parte más alta del movimiento, contrayendo los isquiotibiales.",
      "Inhala y baja lentamente las piernas de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "3235-zHEpuuc"
  },
  "seated-leg-curls": {
    "id": "seated-leg-curls",
    "name": "Curl Femoral Sentado",
    "muscleGroup": "Isquios",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Ajusta la máquina a tu cuerpo y siéntate en ella con la espalda apoyada en el respaldo.",
      "Coloca la parte baja de las piernas debajo de la palanca acolchada, justo por encima de los tobillos.",
      "Sujeta las asas a los lados de la máquina para mayor apoyo.",
      "Manteniendo la parte superior de las piernas inmóvil, exhala y flexiona las piernas hacia arriba todo lo que puedas.",
      "Mantén la posición contraída durante una pausa breve mientras aprietas los isquiotibiales.",
      "Inhala y baja lentamente la palanca de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0599-Zg3XY7P"
  },
  "stiff-leg-deadlift": {
    "id": "stiff-leg-deadlift",
    "name": "Peso Muerto Piernas Semirrígidas",
    "muscleGroup": "Isquios",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Ponte de pie con los pies separados a la altura de los hombros y coloca la banda alrededor de los tobillos.",
      "Sujeta la banda con ambas manos frente a los muslos, con las palmas mirando hacia el cuerpo.",
      "Manteniendo la espalda recta y el core activado, flexiona las caderas y baja lentamente la parte superior del cuerpo hacia el suelo.",
      "Mientras bajas, empuja las caderas hacia atrás y deja que las rodillas se flexionen ligeramente.",
      "Baja la banda hacia el suelo, sintiendo un estiramiento en los isquiotibiales.",
      "Haz una pausa breve en la posición baja, luego activa los glúteos y los isquiotibiales para levantar la parte superior del cuerpo de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "1009-kuMiR2T"
  },
  "standing-leg-curl": {
    "id": "standing-leg-curl",
    "name": "Curl Femoral de Pie",
    "muscleGroup": "Isquios",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Ajusta la máquina de cable de modo que el accesorio para el tobillo quede en la posición más baja.",
      "Túmbate boca abajo en el banco con las piernas rectas y el accesorio para el tobillo sujeto a los tobillos.",
      "Sujétate de las agarraderas del banco para mantener la estabilidad.",
      "Manteniendo quieta la parte superior del cuerpo, exhala y flexiona las piernas hacia los glúteos doblando las rodillas.",
      "Haz una pausa breve en la parte más alta del movimiento, contrayendo los isquiotibiales.",
      "Inhala y baja lentamente las piernas de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "3235-zHEpuuc"
  },
  "db-romanian-deadlift": {
    "id": "db-romanian-deadlift",
    "name": "Peso Muerto Rumano con Mancuernas",
    "muscleGroup": "Isquios",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Ponte de pie con los pies separados a la altura de los hombros, con las puntas de los pies apuntando hacia adelante.",
      "Sostén una mancuerna en cada mano, con las palmas hacia el cuerpo y los brazos extendidos hacia abajo.",
      "Flexiona las caderas y las rodillas, bajando las mancuernas hacia el suelo mientras mantienes la espalda recta.",
      "Empuja con los talones y extiende las caderas y las rodillas, levantando las mancuernas de nuevo a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0300-nUwVh7b"
  },
  "hip-thrust": {
    "id": "hip-thrust",
    "name": "Hip Thrust",
    "muscleGroup": "Glúteos",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Comienza arrodillándote en el suelo con las rodillas separadas a la altura de las caderas y los pies flexionados.",
      "Envuelve la banda elástica alrededor de los muslos, justo por encima de las rodillas.",
      "Coloca las manos en las caderas o extiéndelas frente a ti para mantener el equilibrio.",
      "Activa los glúteos y los músculos del core.",
      "Empuja las caderas hacia adelante y aprieta los glúteos mientras levantas las rodillas del suelo, extendiendo las caderas hasta que los muslos queden paralelos al suelo.",
      "Mantén la posición por un momento y luego baja lentamente las rodillas de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "3236-Pjbc0Kt"
  },
  "cable-kickbacks": {
    "id": "cable-kickbacks",
    "name": "Patada de Glúteo en Polea",
    "muscleGroup": "Glúteos",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Ponte de pie frente a una máquina de cable con los pies separados a la altura de los hombros.",
      "Sujeta la agarradera del cable con la mano derecha y retrocede un paso para crear tensión en el cable.",
      "Flexiona ligeramente las rodillas e inclínate hacia adelante desde las caderas, manteniendo la espalda recta.",
      "Mantén la parte superior del brazo cerca del cuerpo y el codo flexionado en un ángulo de 90 grados.",
      "Extiende el antebrazo hacia atrás, enderezando el brazo por completo.",
      "Haz una pausa por un momento, luego regresa lentamente a la posición inicial.",
      "Repite el número de repeticiones deseado, luego cambia de lado."
    ],
    "mediaId": "0860-HEJ6DIX"
  },
  "abductor-machine": {
    "id": "abductor-machine",
    "name": "Abducción en Máquina",
    "muscleGroup": "Glúteos",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Túmbate de lado con las piernas rectas y apiladas una sobre la otra.",
      "Coloca el brazo de abajo bajo la cabeza para apoyarte.",
      "Activa el core y levanta la pierna superior lo más alto posible sin rotar las caderas ni inclinarte hacia atrás.",
      "Haz una pausa por un momento en la posición alta, luego baja lentamente la pierna de nuevo a la posición inicial.",
      "Repite el número de repeticiones deseado, luego cambia de lado."
    ],
    "mediaId": "1427-mQ1tBXn"
  },
  "glute-bridge": {
    "id": "glute-bridge",
    "name": "Puente de Glúteo",
    "muscleGroup": "Glúteos",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Empieza tumbado boca arriba en el suelo con las rodillas flexionadas y los pies planos sobre el suelo.",
      "Coloca una barra sobre las caderas, sujetándola con firmeza con ambas manos.",
      "Activa los glúteos y el core, luego levanta las caderas del suelo hasta que el cuerpo forme una línea recta desde las rodillas hasta los hombros.",
      "Haz una pausa breve en la parte alta, apretando los glúteos.",
      "Baja lentamente las caderas de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "1409-qKBpF7I"
  },
  "lateral-lunges": {
    "id": "lateral-lunges",
    "name": "Zancada Lateral",
    "muscleGroup": "Glúteos",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Ponte de pie con los pies separados a la altura de los hombros, sujetando una barra sobre la parte superior de la espalda.",
      "Da un paso grande hacia el lado con el pie derecho, manteniendo el pie izquierdo fijo en el suelo.",
      "Flexiona la rodilla derecha y baja el cuerpo hacia una posición de zancada, manteniendo la pierna izquierda recta.",
      "Empuja con el pie derecho y vuelve a la posición inicial.",
      "Repite hacia el otro lado, dando el paso con el pie izquierdo."
    ],
    "mediaId": "1410-py1HSzx"
  },
  "step-ups": {
    "id": "step-ups",
    "name": "Subidas al Cajón (Step-ups)",
    "muscleGroup": "Glúteos",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Coloca una banda alrededor de los muslos, justo por encima de las rodillas.",
      "Ponte de pie frente a un escalón o plataforma con los pies separados a la altura de las caderas.",
      "Sube a la plataforma con el pie derecho, empujando con el talón.",
      "Extiende la pierna izquierda hacia atrás, manteniéndola recta.",
      "Baja el pie izquierdo de nuevo hasta el suelo.",
      "Repite subiendo a la plataforma con el pie izquierdo.",
      "Continúa alternando las piernas durante el número de repeticiones deseado."
    ],
    "mediaId": "1008-d5bTEPV"
  },
  "cable-abduction": {
    "id": "cable-abduction",
    "name": "Patada Lateral en Polea",
    "muscleGroup": "Glúteos",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Ajusta la altura del asiento de modo que tus rodillas formen un ángulo de 90 grados.",
      "Siéntate en la máquina con la espalda apoyada en el respaldo y los pies sobre los apoyapiés.",
      "Coloca las manos en las asas laterales para mayor estabilidad.",
      "Activa los abductores y empuja lentamente las piernas hacia afuera, alejándolas de la línea media del cuerpo.",
      "Haz una pausa al final del movimiento y luego junta lentamente las piernas de nuevo hasta la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0597-CHpahtl"
  },
  "calf-raises-standing": {
    "id": "calf-raises-standing",
    "name": "Elevación de Talones de Pie",
    "muscleGroup": "Gemelos",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Ponte de pie con los pies separados a la altura de las caderas y coloca la banda alrededor de la base de los dedos del pie izquierdo.",
      "Sujétate de un objeto estable para mantener el equilibrio si es necesario.",
      "Levanta lentamente el talón izquierdo del suelo, llevando el peso del cuerpo hacia la punta del pie.",
      "Haz una pausa por un momento en la parte superior, luego baja lentamente el talón izquierdo de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado, luego cambia a la pierna derecha."
    ],
    "mediaId": "0999-9JprnPh"
  },
  "calf-raises-seated": {
    "id": "calf-raises-seated",
    "name": "Elevación de Talones Sentado",
    "muscleGroup": "Gemelos",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Siéntate en un banco con los pies planos sobre el suelo y una barra apoyada sobre los muslos.",
      "Coloca la parte delantera de los pies sobre una plataforma elevada, como un bloque o un escalón.",
      "Coloca la barra sobre los muslos y sujétala con firmeza con las manos.",
      "Manteniendo la espalda recta y el core activado, levanta los talones del suelo extendiendo los tobillos.",
      "Haz una pausa breve en la parte alta y luego baja lentamente los talones de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0088-ktsFQAZ"
  },
  "press-calf-raises": {
    "id": "press-calf-raises",
    "name": "Elevación de Talones en Prensa",
    "muscleGroup": "Gemelos",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Ponte de pie con los pies separados a la altura de las caderas y coloca la banda alrededor de la base de los dedos del pie izquierdo.",
      "Sujétate de un objeto estable para mantener el equilibrio si es necesario.",
      "Levanta lentamente el talón izquierdo del suelo, llevando el peso del cuerpo hacia la punta del pie.",
      "Haz una pausa por un momento en la parte superior, luego baja lentamente el talón izquierdo de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado, luego cambia a la pierna derecha."
    ],
    "mediaId": "0999-9JprnPh"
  },
  "db-overhead-press": {
    "id": "db-overhead-press",
    "name": "Press Militar con Mancuernas",
    "muscleGroup": "Hombros",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Push",
    "steps": [
      "Ponte de pie con los pies separados a la altura de los hombros y sostén una mancuerna en una mano a la altura del hombro, con la palma hacia adelante.",
      "Empuja la mancuerna hacia arriba hasta que el brazo quede completamente extendido por encima de la cabeza.",
      "Haz una pausa breve en la parte más alta, luego baja lentamente la mancuerna de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado, luego cambia al otro brazo."
    ],
    "mediaId": "0361-84RyJf8"
  },
  "bb-overhead-press": {
    "id": "bb-overhead-press",
    "name": "Press Militar con Barra",
    "muscleGroup": "Hombros",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Push",
    "steps": [
      "Siéntate en un banco con la espalda recta y los pies planos sobre el suelo.",
      "Sujeta la barra con un agarre pronado, un poco más ancho que la separación de los hombros.",
      "Levanta la barra del soporte y llévala a la altura de los hombros, con los codos flexionados y las palmas hacia delante.",
      "Empuja la barra por encima de la cabeza extendiendo completamente los brazos.",
      "Haz una pausa breve en la parte alta y luego baja lentamente la barra de vuelta a la altura de los hombros.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0091-kTbSH9h"
  },
  "arnold-press": {
    "id": "arnold-press",
    "name": "Press Arnold",
    "muscleGroup": "Hombros",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Push",
    "steps": [
      "Siéntate en un banco con respaldo y sujeta una mancuerna en cada mano a la altura del hombro, con las palmas hacia tu cuerpo y los codos flexionados.",
      "Empuja las mancuernas hacia arriba hasta que los brazos estén completamente extendidos y las palmas miren hacia adelante.",
      "Rota las muñecas mientras levantas, de modo que las palmas miren hacia adelante en la parte alta del movimiento.",
      "Haz una pausa breve en la parte alta, luego baja lentamente las mancuernas de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "2137-Xy4jlWA"
  },
  "lateral-raises": {
    "id": "lateral-raises",
    "name": "Elevaciones Laterales Mancuernas",
    "muscleGroup": "Hombros",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Push",
    "steps": [
      "Ponte de pie con los pies separados a la altura de los hombros y sostén la banda frente a los muslos con las palmas hacia abajo.",
      "Mantén los brazos rectos y levanta la banda frente a ti hasta que los brazos queden paralelos al suelo.",
      "Haz una pausa por un momento en la parte superior, luego baja lentamente la banda de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0977-sTg7iys"
  },
  "cable-lateral-raises": {
    "id": "cable-lateral-raises",
    "name": "Elevaciones Laterales en Polea",
    "muscleGroup": "Hombros",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Push",
    "steps": [
      "Ponte de pie con los pies separados a la altura de los hombros y sujeta las agarraderas del cable con un agarre prono.",
      "Mantén los brazos rectos y el core activado.",
      "Levanta los brazos hacia los lados hasta que queden paralelos al suelo.",
      "Haz una pausa por un momento en la parte superior, luego baja lentamente los brazos de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0178-goJ6ezq"
  },
  "reverse-flys": {
    "id": "reverse-flys",
    "name": "Reverse Fly / Pájaros Mancuernas",
    "muscleGroup": "Hombros",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Push",
    "steps": [
      "Sujeta la banda a un objeto fijo a la altura del pecho.",
      "Ponte de pie con los pies separados a la altura de los hombros y sostén la banda con ambas manos frente a ti.",
      "Mantén los brazos rectos y levántalos hacia los lados hasta que queden paralelos al suelo.",
      "Junta los omóplatos en la parte superior del movimiento.",
      "Baja lentamente los brazos de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0993-sTfvVsG"
  },
  "cable-reverse-flys": {
    "id": "cable-reverse-flys",
    "name": "Pájaros en Polea",
    "muscleGroup": "Hombros",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Push",
    "steps": [
      "Coloca un mango en D en cada lado de una máquina de cable a la altura de los hombros.",
      "Ponte de pie en el medio de la máquina de cable con los pies separados a la altura de los hombros.",
      "Agarra los mangos con un agarre prono y extiende los brazos hacia los lados, con las palmas hacia adelante.",
      "Mantén una ligera flexión en los codos y conserva la espalda recta durante todo el ejercicio.",
      "Activa los músculos de los hombros y aprieta los omóplatos entre sí mientras tiras de los mangos hacia la parte delantera de tu cuerpo.",
      "Haz una pausa breve en el punto máximo del movimiento, luego regresa lentamente a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0225-P5p0j8B"
  },
  "face-pulls": {
    "id": "face-pulls",
    "name": "Face Pulls",
    "muscleGroup": "Hombros",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Push",
    "steps": [
      "Ponte de pie con los pies separados a la altura de los hombros y coloca la banda bajo los pies.",
      "Sostén las agarraderas de la banda con las palmas mirándose entre sí y los brazos extendidos frente a ti.",
      "Flexiona ligeramente las rodillas e inclínate hacia adelante desde las caderas, manteniendo la espalda recta.",
      "Tira de la banda hacia el pecho, juntando los omóplatos.",
      "Haz una pausa por un momento en la parte superior, luego suelta lentamente la tensión y regresa a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "1022-tc5dYrf"
  },
  "front-raises": {
    "id": "front-raises",
    "name": "Elevaciones Frontales Mancuernas",
    "muscleGroup": "Hombros",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Push",
    "steps": [
      "Ponte de pie con los pies separados a la altura de los hombros y sostén la banda frente a los muslos con las palmas hacia abajo.",
      "Mantén los brazos rectos y levántalos lentamente hacia adelante hasta que queden paralelos al suelo.",
      "Haz una pausa por un momento en la parte superior, luego baja lentamente los brazos de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0978-TFA88iB"
  },
  "upright-row": {
    "id": "upright-row",
    "name": "Tirón al Mentón (Upright Row)",
    "muscleGroup": "Hombros",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Push",
    "steps": [
      "Ponte de pie con los pies separados a la altura de los hombros y sujeta una barra con agarre prono, manos un poco más separadas que el ancho de los hombros.",
      "Deja que la barra cuelgue frente a los muslos, con los brazos completamente extendidos.",
      "Manteniendo la espalda recta y el core activado, exhala y levanta la barra en línea recta hacia la barbilla, guiando el movimiento con los codos.",
      "Haz una pausa breve en la parte más alta, luego inhala y baja lentamente la barra de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0120-UDlhcO8"
  },
  "smith-overhead-press": {
    "id": "smith-overhead-press",
    "name": "Press Militar en Multipower",
    "muscleGroup": "Hombros",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Push",
    "steps": [
      "Ajusta la altura del asiento de modo que las asas queden a la altura de los hombros.",
      "Siéntate en la máquina con la espalda contra la almohadilla y los pies planos sobre el suelo.",
      "Sujeta las asas con un agarre prono y levántalas de los soportes, extendiendo los brazos por completo.",
      "Baja las asas hasta la altura de los hombros, manteniendo los codos ligeramente flexionados.",
      "Empuja las asas hacia arriba, por encima de la cabeza, hasta que los brazos queden completamente extendidos.",
      "Haz una pausa por un momento en la parte alta y luego baja lentamente las agarraderas de vuelta a la altura del hombro.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0765-xUwnBMT"
  },
  "shrugs": {
    "id": "shrugs",
    "name": "Encogimientos de Hombros",
    "muscleGroup": "Hombros",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Push",
    "steps": [
      "Ponte de pie con los pies separados a la altura de los hombros y coloca la banda bajo los pies, sosteniendo los extremos con las manos.",
      "Mantén los brazos rectos y relajados, y deja que la banda cuelgue frente a los muslos.",
      "Activa los trapecios encogiendo los hombros hacia arriba, levantando la banda lo más alto posible.",
      "Mantén la contracción por un momento, luego baja lentamente los hombros de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "1018-trmte8s"
  },
  "bb-curls": {
    "id": "bb-curls",
    "name": "Curl de Bíceps con Barra",
    "muscleGroup": "Bíceps",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Ponte de pie con los pies separados a la altura de los hombros y sujeta una barra en cada mano, con las palmas mirando hacia delante.",
      "Mantén los brazos superiores fijos y exhala mientras levantas el peso contrayendo los bíceps.",
      "Continúa levantando las barras hasta que los bíceps estén completamente contraídos y las barras estén a la altura de los hombros.",
      "Mantén la posición contraída durante una breve pausa mientras aprietas los bíceps.",
      "Inhala mientras comienzas a bajar lentamente las barras de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado, alternando los brazos."
    ],
    "mediaId": "0023-Yza7XrQ"
  },
  "db-alt-curls": {
    "id": "db-alt-curls",
    "name": "Curl Mancuernas Alterno",
    "muscleGroup": "Bíceps",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Ponte de pie con una mancuerna en cada mano, con las palmas hacia adelante y los brazos completamente extendidos.",
      "Manteniendo los brazos superiores fijos, exhala y levanta el peso mientras contraes los bíceps.",
      "Continúa levantando las mancuernas hasta que los bíceps estén completamente contraídos y las mancuernas estén a la altura de los hombros.",
      "Mantén la posición contraída durante una breve pausa mientras aprietas los bíceps.",
      "Inhala y comienza a bajar lentamente las mancuernas de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado, alternando los brazos."
    ],
    "mediaId": "0285-BU15nH4"
  },
  "hammer-curls": {
    "id": "hammer-curls",
    "name": "Curl Martillo",
    "muscleGroup": "Bíceps",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Ponte de pie con los pies separados a la altura de los hombros y una ligera flexión en las rodillas.",
      "Sujeta el accesorio de cuerda del cable con agarre supino, palmas mirándose entre sí, y los brazos completamente extendidos.",
      "Manteniendo los brazos superiores fijos, exhala y levanta el peso mientras contraes los bíceps.",
      "Continúa levantando el accesorio de cuerda del cable hasta que los bíceps estén completamente contraídos y la cuerda esté a la altura de los hombros.",
      "Mantén la posición contraída durante una breve pausa mientras aprietas los bíceps.",
      "Inhala y comienza a bajar lentamente el accesorio de cuerda del cable de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0165-HPlPoQA"
  },
  "preacher-curl": {
    "id": "preacher-curl",
    "name": "Curl Predicador Barra EZ",
    "muscleGroup": "Bíceps",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Siéntate en un banco predicador con el pecho apoyado en el respaldo y los brazos extendidos sobre el borde, sujetando una barra con un agarre supino.",
      "Manteniendo los brazos superiores fijos, exhala y levanta el peso mientras contraes los bíceps.",
      "Continúa levantando la barra hasta que los bíceps estén completamente contraídos y la barra esté a la altura de los hombros.",
      "Mantén la posición contraída durante una breve pausa mientras aprietas los bíceps.",
      "Inhala y comienza a bajar lentamente la barra de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0059-SYJ4Bkt"
  },
  "db-preacher-curl": {
    "id": "db-preacher-curl",
    "name": "Curl Predicador con Mancuerna",
    "muscleGroup": "Bíceps",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Siéntate en un banco scott con una mancuerna en cada mano, con las palmas hacia tu torso y los brazos completamente extendidos.",
      "Mantén los brazos superiores fijos y exhala mientras levantas el peso contrayendo los bíceps.",
      "Continúa levantando las mancuernas hasta que los bíceps estén completamente contraídos y las mancuernas estén a la altura de los hombros.",
      "Mantén la posición contraída durante una breve pausa mientras aprietas los bíceps.",
      "Inhala y comienza a bajar lentamente las mancuernas de vuelta a la posición inicial.",
      "Repite el número de repeticiones recomendado."
    ],
    "mediaId": "1646-fy7Tgy4"
  },
  "cable-curls": {
    "id": "cable-curls",
    "name": "Curl en Polea",
    "muscleGroup": "Bíceps",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Ajusta la máquina de cable de modo que el accesorio para el tobillo quede en la posición más baja.",
      "Túmbate boca abajo en el banco con las piernas rectas y el accesorio para el tobillo sujeto a los tobillos.",
      "Sujétate de las agarraderas del banco para mantener la estabilidad.",
      "Manteniendo quieta la parte superior del cuerpo, exhala y flexiona las piernas hacia los glúteos doblando las rodillas.",
      "Haz una pausa breve en la parte más alta del movimiento, contrayendo los isquiotibiales.",
      "Inhala y baja lentamente las piernas de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "3235-zHEpuuc"
  },
  "concentration-curls": {
    "id": "concentration-curls",
    "name": "Curl Concentrado",
    "muscleGroup": "Bíceps",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Siéntate en un banco o silla con las piernas separadas y los pies apoyados en el suelo.",
      "Sostén un extremo de la banda en la mano y pisa el otro extremo con el pie del mismo lado.",
      "Inclínate ligeramente hacia adelante y apoya el codo en la parte interna del muslo, justo encima de la rodilla.",
      "Con la palma hacia arriba, flexiona lentamente la mano hacia el hombro, manteniendo quieta la parte superior del brazo.",
      "Haz una pausa por un momento en la parte superior, luego baja lentamente la mano de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado, luego cambia de lado."
    ],
    "mediaId": "0976-kmVVAfu"
  },
  "incline-db-curls": {
    "id": "incline-db-curls",
    "name": "Curl Inclinado con Mancuernas",
    "muscleGroup": "Bíceps",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Coloca un banco inclinado a un ángulo de 45 grados.",
      "Túmbate boca abajo en el banco con el pecho y el abdomen apoyados contra él.",
      "Sujeta una barra con un agarre supino, separado a la altura de los hombros.",
      "Extiende completamente los brazos, dejando que la barra cuelgue hacia el suelo.",
      "Manteniendo los brazos superiores fijos, exhala y levanta el peso mientras contraes los bíceps.",
      "Continúa levantando la barra hasta que los bíceps estén completamente contraídos y la barra esté a la altura de los hombros.",
      "Mantén la posición contraída durante una breve pausa mientras aprietas los bíceps.",
      "Inhala y comienza a bajar lentamente la barra de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0072-WLvTAv5"
  },
  "cable-hammer-curls": {
    "id": "cable-hammer-curls",
    "name": "Curl Martillo en Polea",
    "muscleGroup": "Bíceps",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Ponte de pie con los pies separados a la altura de los hombros y una ligera flexión en las rodillas.",
      "Sujeta el accesorio de cuerda del cable con agarre supino, palmas mirándose entre sí, y los brazos completamente extendidos.",
      "Manteniendo los brazos superiores fijos, exhala y levanta el peso mientras contraes los bíceps.",
      "Continúa levantando el accesorio de cuerda del cable hasta que los bíceps estén completamente contraídos y la cuerda esté a la altura de los hombros.",
      "Mantén la posición contraída durante una breve pausa mientras aprietas los bíceps.",
      "Inhala y comienza a bajar lentamente el accesorio de cuerda del cable de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0165-HPlPoQA"
  },
  "zottman-curl": {
    "id": "zottman-curl",
    "name": "Curl Zottman",
    "muscleGroup": "Bíceps",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Siéntate en un banco scott y sostén una mancuerna en una mano con agarre supino.",
      "Apoya el brazo superior sobre la almohadilla del banco scott, permitiendo que el brazo se extienda completamente.",
      "Flexiona la mancuerna de nuevo hacia el hombro, manteniendo el brazo superior quieto.",
      "En la parte superior del curl, gira la muñeca de modo que la palma quede hacia arriba.",
      "Baja lentamente la mancuerna de vuelta a la posición inicial, girando la muñeca de regreso a la posición inicial.",
      "Repite el número de repeticiones deseado, luego cambia de brazo."
    ],
    "mediaId": "1672-sxY5Biu"
  },
  "high-cable-curls": {
    "id": "high-cable-curls",
    "name": "Curl en Polea Alta (Doble Bíceps)",
    "muscleGroup": "Bíceps",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Ajusta la máquina de cable de modo que el accesorio para el tobillo quede en la posición más baja.",
      "Túmbate boca abajo en el banco con las piernas rectas y el accesorio para el tobillo sujeto a los tobillos.",
      "Sujétate de las agarraderas del banco para mantener la estabilidad.",
      "Manteniendo quieta la parte superior del cuerpo, exhala y flexiona las piernas hacia los glúteos doblando las rodillas.",
      "Haz una pausa breve en la parte más alta del movimiento, contrayendo los isquiotibiales.",
      "Inhala y baja lentamente las piernas de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "3235-zHEpuuc"
  },
  "tricep-extensions": {
    "id": "tricep-extensions",
    "name": "Extensión de Tríceps en Polea",
    "muscleGroup": "Tríceps",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Push",
    "steps": [
      "Sujeta una barra recta a una máquina de cable con polea alta.",
      "Ponte de pie de espaldas a la máquina con los pies separados a la altura de los hombros.",
      "Sujeta la barra con un agarre prono, con las manos un poco más separadas que el ancho de los hombros.",
      "Inclínate ligeramente hacia adelante y mantén la espalda recta.",
      "Jala la barra hacia abajo en dirección a tus muslos extendiendo los codos.",
      "Haz una pausa por un momento en la parte baja y luego regresa lentamente la barra a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0172-1PK5Uo3"
  },
  "tricep-overhead": {
    "id": "tricep-overhead",
    "name": "Extensión Tríceps sobre Cabeza",
    "muscleGroup": "Tríceps",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Push",
    "steps": [
      "Ponte de pie con los pies separados a la altura de los hombros y sostén una toalla con ambas manos detrás de la cabeza.",
      "Mantén los codos cerca de las orejas y la parte superior de los brazos quieta.",
      "Extiende lentamente los antebrazos hacia arriba, apretando los tríceps en la parte superior.",
      "Haz una pausa por un momento, luego baja lentamente la toalla de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0018-7HcfMBP"
  },
  "skull-crushers": {
    "id": "skull-crushers",
    "name": "Rompe Cráneos",
    "muscleGroup": "Tríceps",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Push",
    "steps": [
      "Túmbate boca arriba en un banco con los pies planos sobre el suelo y la cabeza en el extremo del banco.",
      "Sujeta la barra con un agarre invertido, palmas mirando hacia la cara, y las manos separadas a la altura de los hombros.",
      "Extiende los brazos rectos por encima del pecho, manteniendo los codos hacia dentro y las muñecas rectas.",
      "Baja lentamente la barra hacia la frente flexionando los codos, manteniendo los brazos superiores fijos.",
      "Haz una pausa breve en la parte baja y luego extiende los brazos de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "1721-yRLPCLu"
  },
  "assisted-dips": {
    "id": "assisted-dips",
    "name": "Fondos Asistidos",
    "muscleGroup": "Tríceps",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Push",
    "steps": [
      "Siéntate en el borde de un banco o silla con las manos sujetando el borde junto a las caderas.",
      "Desliza las caderas hacia adelante, fuera del banco, y estira las piernas, manteniendo los talones en el suelo.",
      "Flexiona los codos y baja el cuerpo hacia el suelo, manteniendo la espalda cerca del banco.",
      "Haz una pausa por un momento en la posición más baja, luego empuja con las manos para enderezar los brazos y levantar el cuerpo de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "3287-LkoAWAE"
  },
  "close-grip-bench": {
    "id": "close-grip-bench",
    "name": "Press Cerrado con Barra",
    "muscleGroup": "Tríceps",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Push",
    "steps": [
      "Sujeta la banda a un punto de anclaje alto, como una barra de dominadas o una viga resistente.",
      "Ponte de pie frente al punto de anclaje y agarra la banda con un agarre supino, con las manos separadas a la altura de los hombros.",
      "Da un paso atrás para generar tensión en la banda, manteniendo los pies separados a la altura de las caderas.",
      "Activa el core y mantén la espalda recta mientras tiras de la banda hacia el pecho, juntando los omóplatos.",
      "Haz una pausa por un momento en la parte inferior del movimiento, luego suelta lentamente la banda de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0974-DptumMx"
  },
  "overhead-cable-extension": {
    "id": "overhead-cable-extension",
    "name": "Extensión Tríceps tras Nuca con Polea",
    "muscleGroup": "Tríceps",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Push",
    "steps": [
      "Siéntate en un banco con la espalda recta y los pies planos sobre el suelo.",
      "Sujeta una barra con un agarre pronado, manos separadas a la altura de los hombros, y levántala por encima de la cabeza.",
      "Baja la barra detrás de la cabeza flexionando los codos, manteniendo los brazos superiores cerca de la cabeza.",
      "Haz una pausa breve y luego extiende los brazos para levantar la barra de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0092-5uFK1xr"
  },
  "db-kickbacks": {
    "id": "db-kickbacks",
    "name": "Patada de Tríceps con Mancuerna",
    "muscleGroup": "Tríceps",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Push",
    "steps": [
      "Ponte de pie frente a una máquina de cable con los pies separados a la altura de los hombros.",
      "Sujeta la agarradera del cable con la mano derecha y retrocede un paso para crear tensión en el cable.",
      "Flexiona ligeramente las rodillas e inclínate hacia adelante desde las caderas, manteniendo la espalda recta.",
      "Mantén la parte superior del brazo cerca del cuerpo y el codo flexionado en un ángulo de 90 grados.",
      "Extiende el antebrazo hacia atrás, enderezando el brazo por completo.",
      "Haz una pausa por un momento, luego regresa lentamente a la posición inicial.",
      "Repite el número de repeticiones deseado, luego cambia de lado."
    ],
    "mediaId": "0860-HEJ6DIX"
  },
  "bench-dips": {
    "id": "bench-dips",
    "name": "Fondos entre Bancos",
    "muscleGroup": "Tríceps",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Push",
    "steps": [
      "Siéntate en el borde de un banco o silla con las manos sujetando el borde junto a las caderas.",
      "Desliza los glúteos fuera del banco y estira las piernas frente a ti, manteniendo los talones en el suelo.",
      "Flexiona los codos y baja el cuerpo hacia el suelo, manteniendo la espalda cerca del banco.",
      "Haz una pausa por un momento en la parte inferior, luego empuja tu cuerpo de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0129-RrLske5"
  },
  "french-press": {
    "id": "french-press",
    "name": "Press Francés con Mancuernas",
    "muscleGroup": "Tríceps",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Push",
    "steps": [
      "Ponte de pie con los pies separados a la altura de los hombros y sostén una toalla con ambas manos detrás de la cabeza.",
      "Mantén los codos cerca de las orejas y la parte superior de los brazos quieta.",
      "Extiende lentamente los antebrazos hacia arriba, apretando los tríceps en la parte superior.",
      "Haz una pausa por un momento, luego baja lentamente la toalla de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0018-7HcfMBP"
  },
  "wrist-curls-prono": {
    "id": "wrist-curls-prono",
    "name": "Curl de Muñeca Prono",
    "muscleGroup": "Antebrazos",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Siéntate en un banco o silla con los pies apoyados en el suelo.",
      "Sostén la banda con un agarre prono, con las palmas hacia abajo, y envuélvela alrededor de los dedos.",
      "Apoya los antebrazos sobre los muslos, con las muñecas colgando del borde.",
      "Flexiona lentamente las muñecas hacia arriba, apretando los antebrazos.",
      "Haz una pausa por un momento en la parte superior, luego baja lentamente las muñecas de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0994-Ezpnw9d"
  },
  "wrist-curls-supino": {
    "id": "wrist-curls-supino",
    "name": "Curl de Muñeca Supino",
    "muscleGroup": "Antebrazos",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Siéntate en un banco o silla con los pies apoyados en el suelo.",
      "Sostén la banda con un agarre prono, con las palmas hacia abajo, y envuélvela alrededor de los dedos.",
      "Apoya los antebrazos sobre los muslos, con las muñecas colgando del borde.",
      "Flexiona lentamente las muñecas hacia arriba, apretando los antebrazos.",
      "Haz una pausa por un momento en la parte superior, luego baja lentamente las muñecas de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0994-Ezpnw9d"
  },
  "reverse-bb-curl": {
    "id": "reverse-bb-curl",
    "name": "Curl Invertido con Barra",
    "muscleGroup": "Antebrazos",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Ponte de pie con los pies separados a la altura de los hombros y sujeta una barra con un agarre pronado, con las palmas hacia abajo.",
      "Mantén los brazos superiores fijos y exhala mientras levantas la barra hacia arriba, contrayendo los bíceps.",
      "Continúa levantando la barra hasta que los bíceps estén completamente contraídos y la barra esté a la altura de los hombros.",
      "Mantén la posición contraída durante una breve pausa mientras aprietas los bíceps.",
      "Inhala mientras bajas lentamente la barra de vuelta a la posición inicial, manteniendo los brazos superiores fijos.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0080-xNrS20v"
  },
  "farmers-walk": {
    "id": "farmers-walk",
    "name": "Paseo del Granjer (Farmer's Walk)",
    "muscleGroup": "Antebrazos",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Ponte de pie con una mancuerna en cada mano, palmas hacia los costados.",
      "Mantén la espalda recta y los hombros hacia atrás.",
      "Da pasos pequeños y controlados hacia adelante, manteniendo una postura erguida.",
      "Continúa caminando durante la distancia o el tiempo deseado.",
      "Para terminar, deja de caminar y baja con cuidado las mancuernas a los costados."
    ],
    "mediaId": "2133-qPEzJjA"
  },
  "plank": {
    "id": "plank",
    "name": "Plancha Abdominal",
    "muscleGroup": "Abdominales",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Comienza tumbado de lado con las piernas extendidas y apiladas una sobre la otra.",
      "Coloca el antebrazo en el suelo justo debajo del hombro, con el codo flexionado en un ángulo de 90 grados.",
      "Activa el core y levanta las caderas del suelo, formando una línea recta desde la cabeza hasta los pies.",
      "Mantén esta posición durante el tiempo deseado.",
      "Baja las caderas de nuevo al suelo y repite hacia el otro lado."
    ],
    "mediaId": "3544-5VXmnV5"
  },
  "hanging-leg-raises": {
    "id": "hanging-leg-raises",
    "name": "Elevaciones de Piernas Colgado",
    "muscleGroup": "Abdominales",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Túmbate sobre tu espalda con las piernas extendidas y los brazos a los lados.",
      "Coloca las manos debajo de los glúteos como apoyo.",
      "Activa el abdomen y levanta las piernas del suelo, manteniéndolas rectas.",
      "Manteniendo las piernas juntas, bájalas hacia un lado hasta que queden a pocos centímetros del suelo.",
      "Haz una pausa por un momento, luego levanta las piernas de vuelta a la posición inicial.",
      "Repite el movimiento hacia el otro lado.",
      "Continúa alternando lados durante el número de repeticiones deseado."
    ],
    "mediaId": "0012-UGhRD1A"
  },
  "cable-crunch": {
    "id": "cable-crunch",
    "name": "Crunch en Polea",
    "muscleGroup": "Abdominales",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Sujeta una agarradera de cuerda a una polea alta y ponte de rodillas de espaldas a la máquina.",
      "Sujeta la agarradera de cuerda con ambas manos y colócala detrás de la cabeza, manteniendo los codos hacia afuera a los lados.",
      "Manteniendo las caderas inmóviles, flexiona la cintura y encoge el torso hacia los muslos.",
      "Haz una pausa por un momento en la parte inferior, luego regresa lentamente a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0175-WW95auq"
  },
  "russian-twist": {
    "id": "russian-twist",
    "name": "Rotación Rusa",
    "muscleGroup": "Abdominales",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Siéntate en el suelo con las rodillas flexionadas y los pies apoyados en el suelo.",
      "Sostén el balón medicinal con ambas manos frente al pecho.",
      "Inclínate ligeramente hacia atrás, activando el abdomen y manteniendo la espalda recta.",
      "Gira lentamente el torso hacia la derecha, llevando el balón medicinal hacia el lado derecho del cuerpo.",
      "Haz una pausa por un momento, luego gira el torso hacia la izquierda, llevando el balón medicinal hacia el lado izquierdo del cuerpo.",
      "Continúa alternando lados durante el número de repeticiones deseado."
    ],
    "mediaId": "0014-r7cT9YD"
  },
  "reverse-crunch": {
    "id": "reverse-crunch",
    "name": "Crunch Inverso",
    "muscleGroup": "Abdominales",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Sujeta un cable a una polea baja y túmbate boca arriba sobre un tapete.",
      "Sujeta el cable con ambas manos y extiende los brazos rectos hacia el techo.",
      "Flexiona las rodillas y levanta las piernas, llevando los muslos hacia el pecho.",
      "Mientras mantienes la parte superior del cuerpo estable, curva la pelvis hacia el pecho, levantando las caderas del tapete.",
      "Haz una pausa por un momento en la parte superior, luego baja lentamente las caderas de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0873-RqOtqD7"
  },
  "side-plank": {
    "id": "side-plank",
    "name": "Plancha Lateral",
    "muscleGroup": "Abdominales",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Comienza tumbado de lado con las piernas extendidas y apiladas una sobre la otra.",
      "Coloca el antebrazo en el suelo justo debajo del hombro, con el codo flexionado en un ángulo de 90 grados.",
      "Activa el core y levanta las caderas del suelo, formando una línea recta desde la cabeza hasta los pies.",
      "Mantén esta posición durante el tiempo deseado.",
      "Baja las caderas de nuevo al suelo y repite hacia el otro lado."
    ],
    "mediaId": "3544-5VXmnV5"
  },
  "ab-wheel": {
    "id": "ab-wheel",
    "name": "Rueda Abdominal (Ab Wheel)",
    "muscleGroup": "Abdominales",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Arrodíllate en el suelo y sostén las agarraderas de la banda con ambas manos, con las palmas hacia abajo.",
      "Coloca la banda en el suelo frente a ti y posiciona las manos separadas a la altura de los hombros.",
      "Activa el core y rueda lentamente la rueda hacia adelante, extendiendo el cuerpo lo más que puedas mientras mantienes el control.",
      "Haz una pausa por un momento en el punto más lejano, luego rueda lentamente la rueda de vuelta hacia las rodillas para regresar a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0971-zhF9lW4"
  },
  "machine-crunch": {
    "id": "machine-crunch",
    "name": "Crunch Abdominal en Máquina",
    "muscleGroup": "Abdominales",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Túmbate sobre tu espalda con las manos detrás de la cabeza y las rodillas flexionadas.",
      "Levanta los pies del suelo y lleva la rodilla derecha hacia el pecho mientras simultáneamente giras el torso para llevar el codo izquierdo hacia la rodilla derecha.",
      "Estira la pierna derecha mientras llevas la rodilla izquierda hacia el pecho y giras el torso para llevar el codo derecho hacia la rodilla izquierda.",
      "Continúa alternando el movimiento de giro, como si estuvieras pedaleando una bicicleta, manteniendo el core activado durante todo el movimiento.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0972-tZkGYZ9"
  },
  "incline-leg-raises": {
    "id": "incline-leg-raises",
    "name": "Elevaciones de Piernas en Banco Inclinado",
    "muscleGroup": "Abdominales",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Túmbate sobre tu espalda con las piernas extendidas y los brazos a los lados.",
      "Coloca las manos debajo de los glúteos como apoyo.",
      "Activa el abdomen y levanta las piernas del suelo, manteniéndolas rectas.",
      "Manteniendo las piernas juntas, bájalas hacia un lado hasta que queden a pocos centímetros del suelo.",
      "Haz una pausa por un momento, luego levanta las piernas de vuelta a la posición inicial.",
      "Repite el movimiento hacia el otro lado.",
      "Continúa alternando lados durante el número de repeticiones deseado."
    ],
    "mediaId": "0012-UGhRD1A"
  },
  "cable-woodchopper": {
    "id": "cable-woodchopper",
    "name": "Leñador en Polea (Woodchopper)",
    "muscleGroup": "Abdominales",
    "type": "Aislamiento",
    "category": "Dumbbell",
    "mechanic": "isolation",
    "force": "Pull",
    "steps": [
      "Siéntate sobre un balón de estabilidad con los pies apoyados planos en el suelo y las rodillas flexionadas en un ángulo de 90 grados.",
      "Sujeta la agarradera del cable con ambas manos y extiende los brazos rectos frente a ti.",
      "Inclínate ligeramente hacia atrás manteniendo la espalda recta y el core activado.",
      "Gira el torso hacia la derecha, llevando la agarradera del cable hacia la cadera derecha.",
      "Haz una pausa por un momento y luego gira el torso hacia la izquierda, llevando la agarradera del cable hacia la cadera izquierda.",
      "Continúa alternando los giros el número de repeticiones deseado."
    ],
    "mediaId": "0211-d9Xaxq6"
  },
  "treadmill": {
    "id": "treadmill",
    "name": "Cinta de Correr",
    "muscleGroup": "Cardio",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Ajusta el nivel de inclinación de la cinta de correr a la intensidad deseada.",
      "Ponte de pie sobre la cinta de correr con los pies separados a la altura de los hombros.",
      "Comienza a caminar a un ritmo cómodo, asegurándote de mantener una forma correcta.",
      "Activa los músculos del core y mantén la espalda recta durante todo el ejercicio.",
      "Continúa caminando en la cinta inclinada durante la duración deseada de tu entrenamiento cardiovascular.",
      "Disminuye gradualmente la inclinación y la velocidad de la cinta para enfriar antes de detenerte."
    ],
    "mediaId": "3666-rjiM4L3"
  },
  "cycling": {
    "id": "cycling",
    "name": "Bicicleta Estática",
    "muscleGroup": "Cardio",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Túmbate sobre tu espalda con las manos detrás de la cabeza y las rodillas flexionadas.",
      "Levanta los pies del suelo y lleva la rodilla derecha hacia el pecho mientras simultáneamente giras el torso para llevar el codo izquierdo hacia la rodilla derecha.",
      "Estira la pierna derecha mientras llevas la rodilla izquierda hacia el pecho y giras el torso para llevar el codo derecho hacia la rodilla izquierda.",
      "Continúa alternando el movimiento de giro, como si estuvieras pedaleando una bicicleta, manteniendo el core activado durante todo el movimiento.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0972-tZkGYZ9"
  },
  "rowing-machine": {
    "id": "rowing-machine",
    "name": "Máquina de Remo",
    "muscleGroup": "Cardio",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Adopta la posición inicial manteniendo la alineación postural adecuada y el core firmemente activado.",
      "Inicia la fase excéntrica de manera controlada (2-3 segundos), sintiendo la tensión en el grupo muscular objetivo.",
      "Mantén una breve pausa de control postural en el punto de máximo rango articular libre de dolor.",
      "Ejecuta la fase concéntrica aplicando fuerza sostenida mientras exhalas el aire de los pulmones.",
      "Completa las repeticiones planificadas manteniendo una cadencia uniforme y sin apoyarte en inercias."
    ],
    "mediaId": null
  },
  "elliptical": {
    "id": "elliptical",
    "name": "Elíptica",
    "muscleGroup": "Cardio",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Ajusta el nivel de resistencia y la inclinación de la máquina elíptica a los valores deseados.",
      "Sube a los pedales de la máquina y agarra las asas con suavidad.",
      "Comienza empujando hacia abajo con los pies y tirando de las asas hacia tu cuerpo.",
      "Continúa con este movimiento, alternando entre empujar y tirar, para simular un movimiento de caminar o correr.",
      "Mantén un ritmo constante y conserva el core activado durante todo el ejercicio.",
      "Continúa durante la duración deseada de tu entrenamiento cardiovascular.",
      "Disminuye gradualmente la intensidad y la velocidad de la máquina antes de bajarte."
    ],
    "mediaId": "2141-rjtuP6X"
  },
  "jump-rope": {
    "id": "jump-rope",
    "name": "Saltar la Cuerda",
    "muscleGroup": "Cardio",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Ponte de pie con los pies separados a la altura de los hombros y las rodillas ligeramente flexionadas.",
      "Sujeta un extremo de la cuerda en cada mano, con las palmas mirándose entre sí.",
      "Levanta los brazos hasta la altura de los hombros, manteniendo los codos ligeramente flexionados.",
      "Comienza a hacer ondas alternas con las cuerdas, levantando y bajando rápidamente cada brazo.",
      "Continúa durante el tiempo o el número de repeticiones deseado."
    ],
    "mediaId": "0128-RJa4tCo"
  },
  "stairmaster": {
    "id": "stairmaster",
    "name": "Subir Escaleras (Stairmaster)",
    "muscleGroup": "Cardio",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Ponte de pie en el borde de un escalón o una plataforma firme, con los talones colgando y la punta de los pies sobre el escalón.",
      "Sujétate de una baranda o pared para mantener el equilibrio si es necesario.",
      "Levanta lentamente los talones lo más alto posible, elevando el peso de tu cuerpo sobre la punta de los pies.",
      "Haz una pausa breve en la parte alta y luego baja lentamente los talones de vuelta a la posición inicial.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "1490-6HmFgmx"
  },
  "swimming": {
    "id": "swimming",
    "name": "Natación",
    "muscleGroup": "Cardio",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Túmbate boca abajo sobre una esterilla con los brazos extendidos por encima de la cabeza.",
      "Activa el core y levanta el pecho y las piernas del suelo al mismo tiempo.",
      "Mueve las piernas hacia arriba y hacia abajo con un movimiento de aleteo, como si estuvieras nadando.",
      "Continúa el movimiento de patada el número de repeticiones deseado.",
      "Baja el pecho y las piernas de nuevo a la posición inicial."
    ],
    "mediaId": "3433-SP3hUez"
  },
  "brisk-walk": {
    "id": "brisk-walk",
    "name": "Caminar a Ritmo Ligero",
    "muscleGroup": "Cardio",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Ponte de pie con una mancuerna en cada mano, palmas hacia los costados.",
      "Mantén la espalda recta y los hombros hacia atrás.",
      "Da pasos pequeños y controlados hacia adelante, manteniendo una postura erguida.",
      "Continúa caminando durante la distancia o el tiempo deseado.",
      "Para terminar, deja de caminar y baja con cuidado las mancuernas a los costados."
    ],
    "mediaId": "2133-qPEzJjA"
  },
  "hiit-run": {
    "id": "hiit-run",
    "name": "HIIT en Cinta",
    "muscleGroup": "Cardio",
    "type": "Compuesto",
    "category": "Barbell",
    "mechanic": "compound",
    "force": "Pull",
    "steps": [
      "Túmbate sobre tu espalda con las manos detrás de la cabeza y las rodillas flexionadas.",
      "Levanta los pies del suelo y lleva la rodilla derecha hacia el pecho mientras simultáneamente giras el torso para llevar el codo izquierdo hacia la rodilla derecha.",
      "Estira la pierna derecha mientras llevas la rodilla izquierda hacia el pecho y giras el torso para llevar el codo derecho hacia la rodilla izquierda.",
      "Continúa alternando el movimiento de giro, como si estuvieras pedaleando una bicicleta, manteniendo el core activado durante todo el movimiento.",
      "Repite el número de repeticiones deseado."
    ],
    "mediaId": "0972-tZkGYZ9"
  }
};
