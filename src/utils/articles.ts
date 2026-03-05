export type Article = {
  id: string
  title: string
  excerpt: string
  content: string[]
  image: string
  categories: string[]
  posted: string // ISO date string
}

const articles: Article[] = [
  {
    id: '1',
    title: "Comprendre le TENS: bases et bénéfices",
    excerpt: "Le TENS stimule en douceur les nerfs pour soulager la douleur et améliorer le confort au quotidien.",
    content: [
      "Le TENS (stimulation électrique transcutanée) est une technique non invasive qui utilise de faibles impulsions électriques pour moduler la transmission de la douleur.",
      "Employé depuis des dizaines d’années, il est particulièrement utile dans les douleurs chroniques, en complément d’une prise en charge globale.",
      "Une utilisation régulière, avec une intensité confortable et une bonne qualité de contact, optimise les résultats." 
    ],
    image: 'https://images.unsplash.com/photo-1550831106-9380cdfb0d4d?auto=format&fit=crop&w=600&q=60',
    categories: ['TENS', 'Douleur chronique', 'Bases'],
    posted: '2024-05-20',
  },
  {
    id: '2',
    title: "Placement des électrodes: guide pas-à-pas",
    excerpt: "Un positionnement précis améliore l’efficacité et le confort de vos séances.",
    content: [
      "Placez l’électrode basse près de la malléole interne et l’électrode haute légèrement au-dessus, le long du nerf tibial postérieur.",
      "Assurez un bon contact peau/gel et serrez la sangle sans excès pour éviter toute gêne.",
      "Repositionnez si nécessaire: un léger picotement sous le pied signe généralement un réglage efficace." 
    ],
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=60',
    categories: ['Guide', 'Électrodes', 'Confort'],
    posted: '2024-05-28',
  },
  {
    id: '3',
    title: "Ajuster l’intensité en toute sécurité",
    excerpt: "Montez progressivement jusqu’à une sensation nette mais confortable, puis redescendez si besoin.",
    content: [
      "Augmentez l’intensité par paliers de quelques secondes pour laisser au corps le temps de s’adapter.",
      "Évitez la douleur et les contractions fortes. Une sensation de fourmillement est attendue.",
      "Si l’appareil se déconnecte, l’intensité retombe à zéro: relancez depuis un niveau bas." 
    ],
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=60',
    categories: ['Sécurité', 'Réglages'],
    posted: '2024-06-01',
  },
  {
    id: '4',
    title: "Rituel quotidien: créer l’habitude gagnante",
    excerpt: "Des séances régulières renforcent l’effet durable: visez un créneau fixe chaque jour.",
    content: [
      "Choisissez un moment récurrent (après le petit-déjeuner, le soir devant une série…) pour ancrer la routine.",
      "Notez vos ressentis: douleur perçue, confort, qualité du sommeil. Ces repères guident les ajustements.",
      "La constance prime sur l’intensité: mieux vaut 20 minutes chaque jour qu’une longue séance occasionnelle." 
    ],
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=60',
    categories: ['Habitudes', 'Suivi', 'Confort'],
    posted: '2024-06-05',
  },
  {
    id: '5',
    title: "Entretien et longévité des électrodes",
    excerpt: "Un entretien simple prolonge l’adhérence et la performance de vos électrodes.",
    content: [
      "Nettoyez les électrodes à l’eau tiède une fois par semaine et laissez-les sécher à l’air libre.",
      "Conservez les patchs sur leur film plastique et refermez le sachet hermétique après chaque usage.",
      "Remplacez-les si la surface est usée, sèche ou moins adhésive malgré le nettoyage." 
    ],
    image: 'https://images.unsplash.com/photo-1512427691650-1f6a3f288ca5?auto=format&fit=crop&w=600&q=60',
    categories: ['Guide', 'Entretien'],
    posted: '2024-06-10',
  },
]

export function listArticles(): Article[] {
  return [...articles].sort((a, b) => new Date(b.posted).getTime() - new Date(a.posted).getTime())
}

export function getArticle(id: string): Article | undefined {
  return articles.find(a => a.id === id)
}

export function getCategories(): string[] {
  const set = new Set<string>()
  for (const a of articles) a.categories.forEach(c => set.add(c))
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}

export function searchArticles(query: string, category?: string): Article[] {
  const q = query.trim().toLowerCase()
  return listArticles().filter(a => {
    const matchesQ = !q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.content.some(p => p.toLowerCase().includes(q))
    const matchesCat = !category || a.categories.includes(category)
    return matchesQ && matchesCat
  })
}

export function getAdjacent(id: string): { prev?: Article; next?: Article } {
  const arr = listArticles()
  const idx = arr.findIndex(a => a.id === id)
  return {
    prev: idx > 0 ? arr[idx - 1] : undefined,
    next: idx >= 0 && idx < arr.length - 1 ? arr[idx + 1] : undefined,
  }
}
