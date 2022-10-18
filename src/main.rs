use server::setup_server;
use telegram::setup_bot;
use tokio::join;

mod db;
mod frontend;
mod list;
mod server;
mod telegram;

#[tokio::main]
async fn main() {
    join!(setup_server(),setup_bot());
}
