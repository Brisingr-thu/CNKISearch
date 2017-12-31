export function genNewsQuery (text, from) {
  return {
    'query': {
      'function_score': {
        'query': {
          'bool': {
            'should': [
              {
                'multi_match': {
                  'query': text,
                  'analyzer': 'ik_smart',
                  'type': 'most_fields',
                  'fields': ['title^10', 'title.en^5', 'title.max^5', 'content^2', 'content.en^2', 'content.max^1', 'content.std^1', 'h1^8', 'h1.max^1', 'h1.en^4', 'h1.std^2', 'keyword^10', 'keyword.en^5'],
                  'boost': 1
                }
              },
              {
                'multi_match': {
                  'query': text,
                  'analyzer': 'ik_max_word',
                  'type': 'cross_fields',
                  'fields': ['title^10', 'title.en^5', 'title.max^5', 'content^2', 'content.en^2', 'content.max^1', 'content.std^1', 'h1^8', 'h1.max^1', 'h1.en^4', 'h1.std^2', 'keyword^10', 'keyword.en^5'],
                  'boost': 8
                }
              }
            ]
          }

        },
        'script_score': {
          'script': '_score * Math.log((1/(1+Math.pow(Math.E, -doc["pagerank"].value))) * 10)'
        }
      }
    },
    'highlight': {
      'fields': {
        'content': {'type': 'fvh', 'pre_tags': ['<em>'], 'post_tags': ['</em>']},
        'title': {'type': 'fvh', 'pre_tags': ['<em>'], 'post_tags': ['</em>']}
      }
    },
    'from': from
  }
}

export function genWebQuery (text, from) {
  return {
    'query': {
      'function_score': {
        'query': {
          'bool': {
            'should': [
              {
                'multi_match': {
                  'query': text,
                  'analyzer': 'ik_smart',
                  'type': 'most_fields',
                  'fields': ['title^5', 'title.en^5', 'title.max^5', 'content^1', 'content.en^1', 'content.max^1', 'content.std^1', 'h1^4', 'h1.max^4', 'h1.en^4', 'h1.std^2', 'keyword^5', 'keyword.en^5', 'h2^3', 'h2.max^3', 'h2.en^3', 'h2.std^1', 'h*^1', 'h*.*^1'],
                  'boost': 1
                }
              },
              {
                'multi_match': {
                  'query': text,
                  'analyzer': 'ik_max_word',
                  'type': 'cross_fields',
                  'fields': ['title^5', 'title.en^5', 'title.max^5', 'content^1', 'content.en^1', 'content.max^1', 'content.std^1', 'h1^4', 'h1.max^4', 'h1.en^4', 'h1.std^2', 'keyword^5', 'keyword.en^5', 'h2^3', 'h2.max^3', 'h2.en^3', 'h2.std^1', 'h*^1', 'h*.*^1'],
                  'boost': 6
                }
              }
            ]
          }

        },
        'script_score': {
          'script': '_score * Math.log((1/(1+Math.pow(Math.E, -doc["pagerank"].value))) * 10)'
        }
      }
    },
    '_source': {
      'excludes': ['content']
    },
    'highlight': {
      'fields': {
        'content': {'type': 'fvh'},
        'title': {'type': 'fvh'}
      }
    },
    'from': from
  }
}

export function genPdfQuery (text, from) {
  return {
    'query': {
      'multi_match': {
        'query': text,
        'type': 'phrase',
        'analyzer': 'ik_smart',
        'fields': ['title^10', 'title.en^10', 'author^5', 'author.en^5', 'content^1', 'content.en^1']
      }
    },
    '_source': {
      'excludes': ['content']
    },
    'highlight': {
      'fields': {
        'title': {'type': 'fvh'},
        'title.en': {},
        'author': {'type': 'fvh'},
        'author.en': {},
        'content': {'type': 'fvh'},
        'content.en': {}
      }
    },
    from
  }
}
