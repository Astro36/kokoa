extern crate hangeul;
extern crate regex;

use regex::Regex;
use std::collections::HashMap;

fn assemble(syllables: Vec<char>) -> String {
    for c in syllables {

    }
    components
        .into_iter()
        .map(|component| {
            hangeul::compose(component.0, component.1, Some(component.2)).unwrap_or(component.0)
        })
        .collect()
}

fn disassemble(string: &str) -> Vec<char> {
    string
        .chars()
        .flat_map(|c| {
            let mut syllables = vec![
                hangeul::get_choseong(c).unwrap(),
                hangeul::get_jungseong(c).unwrap(),
            ];
            let jongseong = hangeul::get_jongseong(c).unwrap();
            if jongseong.is_some() {
                syllables.push(jongseong.unwrap());
            }
            syllables
        })
        .collect()
}

fn split(content: &str) -> Vec<String> {
    let alphabet = Regex::new("^[A-z]+$").unwrap();
    let hangul = Regex::new("^[가-힣]+$").unwrap();
    let number = Regex::new("^[0-9]+$").unwrap();
    let mut chunks = Vec::<String>::new();
    let mut previous_chunk = "".to_string();
    for s in content.chars().map(|c| c.to_string()) {
        if (alphabet.is_match(&previous_chunk) && alphabet.is_match(&s))
            || (hangul.is_match(&previous_chunk) && hangul.is_match(&s))
            || (number.is_match(&previous_chunk) && number.is_match(&s))
            || &previous_chunk == ""
        {
            previous_chunk.push_str(&s);
        } else {
            chunks.push(previous_chunk);
            previous_chunk = "".to_string();
            previous_chunk.push_str(&s);
        }
    }
    chunks.push(previous_chunk);
    chunks
}

pub struct Kokoa {
    word_frequency: HashMap<String, String>,
}

impl Kokoa {
    pub fn new() -> Kokoa {
        Kokoa {
            word_frequency: HashMap::new(),
        }
    }

    pub fn train(&self, document: &str) -> bool {
        let hangul = Regex::new("^[가-힣]+$").unwrap();
        let chunks: String = split(&document)
            .into_iter()
            .filter(|chunk| hangul.is_match(&chunk))
            .map(|chunk| {
                // let subtexts = Vec::new();
                let chars = disassemble(&chunk);
                println!("{:?}", &chars);
                for i in 0..chars.len() {
                    println!("{}", i);
                    // let subtext = assemble(&chars[0..i]);
                    // println!("{}", &subtext);
                    // if !hangeul::is_jaeum(&subtext[-1]) {
                    //     subtexts.push(subtext);
                    // }
                }
                chunk
            })
            .collect();
        println!("{:?}", &chunks);
        //     const { sentenceTokenizer, words } = this;
        // const hangulRegex = /^[ㄱ-ㅎ가-힣]+$/;
        // const chucks = flatten(sentenceTokenizer.run(document))
        //   .filter(value => hangulRegex.test(value))
        //   .map((chuck) => {
        //     const subtexts = [];
        //     const chars = Hangul.disassemble(chuck);
        //     for (let i = 1, len = chars.length; i <= len; i += 1) {
        //       const subtext = Hangul.assemble(chars.slice(0, i));
        //       if (!Hangul.isConsonant(subtext[subtext.length - 1])) {
        //         subtexts.push(subtext);
        //       }
        //     }
        //     return subtexts;
        //   });
        // // Extract all words and count how many words appear.
        // const counts = {};
        // for (let i = 0, len = chucks.length; i < len; i += 1) {
        //   const subtexts = chucks[i];
        //   for (let j = 0, len2 = subtexts.length; j < len2; j += 1) {
        //     const subtext = subtexts[j];
        //     if (subtext in counts) {
        //       counts[subtext] += 1;
        //     } else {
        //       counts[subtext] = 1;
        //     }
        //   }
        // }
        // // Calculate cohension n-gram value.
        // const uniqueSubtexts = Object.keys(counts);
        // const cohensions = {};
        // for (let i = 0, len = uniqueSubtexts.length; i < len; i += 1) {
        //   const subtext = uniqueSubtexts[i];
        //   if (subtext.length === 1) {
        //     cohensions[subtext] = 0.1;
        //   } else {
        //     const exp = 1 / Hangul.disassemble(subtext).length;
        //     cohensions[subtext] = (counts[subtext] / counts[subtext[0]]) ** exp;
        //   }
        // }
        // // Train new words.
        // for (let i = 0, len = chucks.length; i < len; i += 1) {
        //   const subtexts = chucks[i];
        //   let word = null;
        //   let score = 0;
        //   for (let j = 0, len2 = subtexts.length; j < len2; j += 1) {
        //     const subtext = subtexts[j];
        //     const subtextCohension = cohensions[subtext];
        //     if (subtextCohension >= score) {
        //       word = subtext;
        //       score = subtextCohension;
        //     } else {
        //       break;
        //     }
        //   }
        //   if (!(word in words) && word.length > 1) {
        //     words[word] = ['미지정'];
        //   }
        // }
        true
    }

    pub fn run(&self, document: &str) {
        println!("{}", &document);
    }
}

fn main() {
    let sentence = "안녕하세요ㄱㄱaa! 돼지";
    let kokoa = Kokoa::new();
    kokoa.train(&sentence);
    println!("{:?}", split("안녕ㅎㅎㅎㅎ12 4rr ?"))
}
