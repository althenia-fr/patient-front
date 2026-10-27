

export let formConfig = {
    satisfaction: {
        title: 'Questionnaire de Satisfaction',
        introduction: "Ce questionnaire évalue la façon dont votre traitement par neurostimulation vous a été expliqué et mis en place.",
        questions: [
            {
                id: 'q1',
                text: "Les explications sur le fonctionnement et les objectifs du TENS étaient-elles claires?",
                short_text: "Explications",
                options: [
                    'Très claires',
                    'Plutôt claires',
                    'Moyen',
                    'Pas claires'
                ]
            },
            {
                id: 'q2',
                text: "Les explications sur la pose des électrodes et le réglage de l'intensité étaient-elles claires?",
                short_text: "Electrodes et intensité",
                options: [
                    'Très claires',
                    'Plutôt claires',
                    'Moyen',
                    'Pas claires'
                ]
            },
            {
                id: 'q3',
                text: "Les explications sur l'utilisation du boîtier TENS étaient-elles claires?",
                short_text: "boitier TENS",
                options: [
                    'Très claires',
                    'Plutôt claires',
                    'Moyen',
                    'Pas claires'
                ]
            },
            {
                id: 'q4',
                text: "L'accès à l'assistance était-il facile ?",
                short_text: "Accès à l'assistance",
                options: [
                    'Très facile',
                    'Plutôt facile',
                    'Moyen',
                    'Pas facile'
                ]
            },
            {
                id: 'q5',
                text: "Pour résumer, quelle est votre satisfaction concernant la mise en place du traitement ?",
                short_text: "Satisfaction globale de mise en place",
                options: [
                    'Tres satisfait',
                    'Satisfait',
                    'Un peu satisfait',
                    'Moyen',
                    'Un peu déçu',
                    'Déçu',
                    'Très déçu',
                ]
            }
        ]
    },
  pgi: {
    title: 'Questionnaire PG-I',
    introduction: "Ce questionnaire évalue l'évolution de votre état.",
    questions: [
      {
        id: 'q1',
        text: "Depuis que vous avez commencé le traitement, comment décririez-vous votre état maintenant par rapport à avant ?",
        short_text: "Evolution",
        options: [
          'Très grandement mieux',
          'Grandement mieux',
          'Un peu mieux',
          'Pas de changement',
          'Un peu plus mal',
          'Grandement plus mal',
          'Très grandement plus mal',
        ],
      },
    ]
  },
    usp: {
        title: 'Questionnaire USP',
        introduction: "Les questions suivantes portent sur l'intensité et la fréquence des symptômes urinaires que vous avez eus au cours des 4 dernières semaines.",
        questions: [
            {
                id: 'q1',
                text: 'Incontinence lors d\'efforts physiques importants (sport, grosse toux)',
                short_text: "Incontinence lors effort important",
                options: ['Jamais', 'Moins d\'une fois/semaine', 'Plusieurs fois/semaine', 'Plusieurs fois/jour'],
            },
            {
                id: 'q2',
                text: 'Incontinence lors d\'efforts physiques modérés (escaliers)',
                short_text: "Incontinence lors effort modéré",
                options: ['Jamais', 'Moins d\'une fois/semaine', 'Plusieurs fois/semaine', 'Plusieurs fois/jour'],
            },
            {
                id: 'q3',
                text: 'Incontinence lors d\'efforts physiques légers (marche, changement de position)',
                short_text: "Incontinence lors effort léger",
                options: ['Jamais', 'Moins d\'une fois/semaine', 'Plusieurs fois/semaine', 'Plusieurs fois/jour'],
            },
            {
                id: 'q4',
                text: 'Combien de fois avez-vous dû vous précipiter aux toilettes pour uriner en raison d\'un besoin urgent ?',
                short_text: "Urgences",
                options: ['Jamais', 'Moins d\'une fois par semaine', 'Plusieurs fois par semaine', 'Plusieurs fois par jour'],
            },
            {
                id: 'q5',
                text: 'Quand vous êtes pris par un besoin urgent d\'uriner, combien de minutes en moyenne pouvez-vous vous retenir ?',
                short_text: "Se retenir",
                options: ['Plus de 15 minutes', 'De 6 à 15 minutes', 'De 1 à 5 minutes', 'Moins de 1 minute'],
            },
            {
                id: 'q6',
                text: 'Combien de fois avez-vous eu une fuite d\'urine précédée d\'un besoin urgent d\'uriner que vous n\'avez pas pu contrôler ?',
                short_text: "Impossible de se retenir",
                options: ['Jamais', 'Moins d\'une fois par semaine', 'Plusieurs fois par semaine', 'Plusieurs fois par jour'],
            },
            {
                id: 'q7',
                text: 'Dans ces circonstances, quel type de fuites avez-vous ?',
                short_text: "Type de fuites",
                options: ['Pas de fuites dans cette circonstance', 'Quelques gouttes', 'Fuites en petites quantités', 'Fuites inondantes'],
            },
            {
                id: 'q8',
                text: 'Pendant la journée, quel est le temps habituel espaçant deux mictions ?',
                short_text: "Entre 2 mictions",
                options: ['2 heures ou plus', 'Entre 1 heure et 2 heures', 'Entre 30 minutes et 1 heure', 'Moins de 30 minutes'],
            },
            {
                id: 'q9',
                text: 'Combien de fois en moyenne avez-vous été réveillé(e) la nuit par un besoin d\'uriner ?',
                short_text: "Réveils nocturnes pour uriner",
                options: ['0 ou 1 fois', '2 fois', '3 ou 4 fois', 'Plus de 4 fois'],
            },
            {
                id: 'q10',
                text: 'Combien de fois avez-vous eu une fuite d\'urine en dormant ou vous êtes-vous réveillé(e) mouillé(e) ?',
                short_text: "Fuites nocturnes",
                options: ['Jamais', 'Moins d\'une fois par semaine', 'Plusieurs fois par semaine', 'Plusieurs fois par jour'],
            },
            {
                id: 'q11',
                text: 'Décrivez votre miction habituelle',
                short_text: "Description miction",
                options: ['Miction normale et rapide', 'Difficile à débuter puis normale', 'Début facile mais longue à terminer', 'Très lente du début à la fin'],
            },
            {
                id: 'q12',
                text: 'Décrivez le jet urinaire',
                short_text: "Description jet",
                options: ['Jet normal et continu', 'Jet interrompu / saccadé', 'Goutte à goutte'],
            },
            {
                id: 'q13',
                text: 'Décrivez la manière dont s\'effectue la miction',
                short_text: "Description miction",
                options: ['Sans pousser avec le ventre', 'En poussant parfois', 'En poussant toujours', 'Miction impossible sans pousser'],
            },
        ]
    },
    qualiveen: {
        title: 'Questionnaire SF-QUALIVEEN®',
        introduction: "Le Questionnaire SF-QUALIVEEN® permet d'évaluer l'impact de la douleur sur votre qualité de vie et votre gêne fonctionnelle.",
        questions: [
            {
                id: 'q1',
                text: 'Avez-vous une gêne (douleur, inconfort, sensation d\'inconfort) lors de la marche ?',
                short_text: "Gêne marche",
                options: ['Pas du tout / Jamais', 'Un petit peu / Rarement', 'Moyennement / De temps en temps', 'Beaucoup / Souvent', 'Énormément / Toujours'],
            },
            {
                id: 'q2',
                text: 'Avez-vous une gêne lors d\'une station debout prolongée ?',
                short_text: "Gêne debout",
                options: ['Pas du tout / Jamais', 'Un petit peu / Rarement', 'Moyennement / De temps en temps', 'Beaucoup / Souvent', 'Énormément / Toujours'],
            },
            {
                id: 'q3',
                text: 'Avez-vous des craintes ou des peurs liées à votre condition ?',
                short_text: "Craintes",
                options: ['Pas du tout / Jamais', 'Un petit peu / Rarement', 'Moyennement / De temps en temps', 'Beaucoup / Souvent', 'Énormément / Toujours'],
            },
            {
                id: 'q4',
                text: 'Avez-vous des préoccupations concernant votre santé ?',
                short_text: "Préoccupations santé",
                options: ['Pas du tout / Jamais', 'Un petit peu / Rarement', 'Moyennement / De temps en temps', 'Beaucoup / Souvent', 'Énormément / Toujours'],
            },
            {
                id: 'q5',
                text: 'Vivez-vous des limitations dans vos activités quotidiennes ?',
                short_text: "Limitations",
                options: ['Pas du tout / Jamais', 'Un petit peu / Rarement', 'Moyennement / De temps en temps', 'Beaucoup / Souvent', 'Énormément / Toujours'],
            },
            {
                id: 'q6',
                text: 'Avez-vous ressenti une diminution de votre qualité de vie ?',
                short_text: "Perte qualité de vie",
                options: ['Pas du tout / Jamais', 'Un petit peu / Rarement', 'Moyennement / De temps en temps', 'Beaucoup / Souvent', 'Énormément / Toujours'],
            },
            {
                id: 'q7',
                text: 'Vous sentez-vous contraint(e) par votre condition dans votre vie sociale ?',
                short_text: "Impact vie sociale",
                options: ['Pas du tout / Jamais', 'Un petit peu / Rarement', 'Moyennement / De temps en temps', 'Beaucoup / Souvent', 'Énormément / Toujours'],
            },
            {
                id: 'q8',
                text: 'Avez-vous ressenti une amélioration de votre condition ?',
                short_text: "Amélioration générale",
                options: ['Énormément / Toujours', 'Beaucoup / Souvent', 'Moyennement / De temps en temps', 'Un petit peu / Rarement', 'Pas du tout / Jamais'],
            },
        ]
    },
    evolution: {
        title: 'Évolution Thérapeutique',
        introduction: "Ce questionnaire permet d'évaluer l'évolution de vos troubles urinaires et l'efficacité de votre traitement." +
            "<br/><br/>Vocabulaire médical: Dans la suite, on utilise le mot <b>Miction</b> qui est le nom médical pour <b>Uriner</b>; <b>Urgenturie</b> désigne un besoin soudain et intense d'uriner",
        questions: [
          {
            id: 'md',
            text: 'Nombre de mictions diurnes',
            short_text: "Mictions diurnes",
            options: ['0-2', '3-5', '6-8', '9+'],
          },
          {
            id: 'mn',
            text: 'Nombre de mictions nocturnes',
            short_text: "Mictions nocturnes",
            options: ['0-2', '3-5', '6-8', '9+'],
          },
            {
                id: 'ud',
                text: "Nombre d'urgenturies diurnes",
                short_text: "Urgenturies diurnes",
              options: ['0-2', '3-5', '6-8', '9+'],
            },
          {
            id: 'un',
            text: "Nombre d'urgenturies nocturnes",
            short_text: "Urgenturies nocturnes",
            options: ['0-2', '3-5', '6-8', '9+'],
          },
            {
                id: 'f',
                text: 'Nombre de fuites urinaires',
                short_text: "Fuites urinaires",
              options: ['0-2', '3-5', '6-8', '9+'],
            },
            {
                id: 'dm',
                text: 'Douleur pelvienne/périnéale pendant la miction',
                short_text: "Douleur pendant miction",
                options: ['Aucune', 'Légère -', 'Légère', 'Légère +', 'Modérée -', 'Modérée', 'Modérée +', 'Intense', 'Sévère', 'Insupportable'],
            },
            {
                id: 'dh',
                text: 'Douleur pelvienne/périnéale hors miction',
                short_text: "Douleur hors miction",
                options: ['Aucune', 'Légère -', 'Légère', 'Légère +', 'Modérée -', 'Modérée', 'Modérée +', 'Intense', 'Sévère', 'Insupportable'],
            },
            {
                id: 'p',
                text: 'État des Protections',
                short_text: "Protections",
                options: ['Sèc', 'Humide', 'Saturé'],
            },/*
            {
                id: 'q7',
                text: 'Évolution de l\'état des Protections',
                short_text: "Evolution protections",
                options: ['Amélioration', 'Stable', 'Dégradation'],
            }*/
        ]
    }
}
