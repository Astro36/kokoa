extern crate hangeul;

fn compose_all(components: &Vec<(char, char, char)>) -> String {
    components
        .into_iter()
        .map(|component| {
            hangeul::compose(component.0, component.1, Some(component.2)).unwrap_or(component.0)
        })
        .collect()
}

fn decompose_all(content: &str) -> Vec<(char, char, char)> {
    content
        .chars()
        .map(|c| {
            (
                hangeul::get_choseong(c).unwrap_or(c),
                hangeul::get_jungseong(c).unwrap_or_default(),
                hangeul::get_jongseong(c)
                    .unwrap_or_default()
                    .unwrap_or_default(),
            )
        })
        .collect()
}

pub struct Kokoa {}

impl Kokoa {
    pub fn new() -> Kokoa {
        Kokoa {}
    }

    pub fn train(&self) -> bool {
        true
    }

    pub fn run(&self, document: &str) {
        println!("{}", &document);
        let d = decompose_all(&document);
        println!("{:?}", &d);
        println!("{}", compose_all(&d));
    }
}

fn main() {
    let sentence = "안녕하세요!";
    let kokoa = Kokoa::new();
    kokoa.run(&sentence);
}
