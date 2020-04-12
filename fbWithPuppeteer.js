let fs = require("fs");
let puppeteer = require("puppeteer");


let cFile = process.argv[2];
let pageName = process.argv[3];
let numPost = process.argv[4];

(async function () {
    try{
        let browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            slowMo: 10,
            args: ['--start-maximzed', '--disable-notifications']
        })
    
        let contents = await fs.promises.readFile(cFile, "utf8");
        let credentials = JSON.parse(contents);
        let user = credentials.user;
        let password = credentials.pwd;
    
        let pages = await browser.pages();
        let page = pages[0];

        //Navigate to the website link
        page.goto("https://www.facebook.com", {
            waitUntil: "networkidle0"
        });
        //wait till this selector (#loginbutton)
        await page.waitForSelector("#loginbutton",{
            visible:true        
        });
        //Fill email ,password and then click on login button
        await page.type("#email",user);
        await page.type("#pass",password);
        await page.click("#loginbutton");

        page.goto( {
            waitUntil: "networkidle0"
        });
        //wait till this selector(.uiTypeahead)
        await page.waitForSelector(".uiTypeahead",{
            visible:true        
        });
        
        //Type at the search bar and then click to the search button
        await page.type("[data-testid=search_input]",pageName);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');

        await page.waitForSelector("._6v_0._4ik4._4ik5",{
            visible:true        
        });
        await page.click("div ._6v_0._4ik4._4ik5 a");

        await page.waitForSelector("[data-key=tab_posts]",{
            visible:true        
        });
        await page.click("[data-key=tab_posts]");

        await page.waitForSelector("#pagelet_timeline_main_column ._1xnd > ._4-u2._4-u8",{
            visible:true        
        });
        let postIdx = 0;
        do{
            let postElements = await page.$$("#pagelet_timeline_main_column ._1xnd > ._4-u2._4-u8");
            await serveElement(postElements[postIdx]);
            postIdx++;
            await page.waitForSelector(".uiMorePagerLoader",{
                hidden: true
            });
        }while (postIdx < numPost);

    }catch(err){
        console.log(err);
    }
})();

async function serveElement(el){
    let toclick = await el.$("._666k");
    await toclick.click();
}