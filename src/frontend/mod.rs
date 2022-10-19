use crate::list::{
    get_list_items,
    get_lists_names,
    Item
};

fn build_styles() -> String {
    "<style>
    html {
        background-color: black;
        text-align: center;
        color: white;
    }

    h1 {
        font-size: 3em;
    }

    a {
        text-decoration: none;
        color: white;
    }

    .item {
        color: white;
        font-size: 1.5em;
        display: flex;
        align-content: space-around;
        justify-content: space-evenly;
        width: 100%;
        padding-bottom:0.5em;
    }

    .skip {
        color: red;
    }

    .bought {
        color: green;
    }

    @media only screen and (max-width: 600px) {
        h1 {
            font-size:3.5em;
        }
        .item {
            font-size: 2.5em;
        }
    }
  </style>"
  .to_string()
}

fn build_head(title: &str) -> String {
    format!(
        "<head>
            <meta name='viewport' content='width=device-width, initial-scale=1'>
            <title>{}</title>
            {}
        <meta charset=\"UTF-8\">
        </head>",
        title,
        build_styles()
    )
}

fn build_item_list(
    id: &str,
    list: &str,
    items: Vec<Item>
) -> String {
    items.iter()
    .map(|item| {
      format!("<div class='item'>
        <a href='/{}/list/{}/item/{}?skip=true' class='skip'>X</a>
        <span>{}</span>
        <a href='/{}/list/{}/item/{}?skip=false' class='bought'>✓</a></div>" ,
        id,
        list,
        item.id,
        item.title,
        id,
        list,
        item.id,
    )
    })
    .collect()
}

fn build_lists(
    id: &str,
    lists: Vec<String>
) -> String {
    lists
        .iter()
        .map(|list| {
            format!(
                "<div class='item'><a href='/{}/list/{}'>{}</a></div>",
                id, list, list
            )
        })
        .collect()
}

pub fn build_list_page(
    id: &str,
    list: &str
) -> String {
    let mut response: String = build_head(list);

    response += &format!("<h1>{}</h1>", list);

    let items = get_list_items(id, list);
    if let Some(i) = items {
        response.push_str(build_item_list(id, list, i).as_str());
    } else {
        response.push_str("Empty list");
    }

    response
}

pub fn build_lists_page(id: &str) -> String {
    let mut response: String = build_head("Lists");

    response.push_str(&build_lists(id, get_lists_names(id)));
    response
}
