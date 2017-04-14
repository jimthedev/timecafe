# TimeCafe

> Timing / performance information for your [TestCafe](https://github.com/DevExpress/testcafe) test tasks.

TestCafe does a great job but it unfortunately only gives you timing for the entire run and not per task.  Task timing is especially important when looking for performance regressions.

It might seem if this was as simple as adding a beforeEach and afterEach with a timer but unfortunately in TestCafe the afterEach fires very late and does not give you an accurate view of timing.  TimeCafe allows you to use beforeEach while allowing you to manually stop the timers at the end of your tests.  This method provides more accurate results.

Other gotchas are that sometimes we want to perform reset operations between tests. For example, you might want to go back to the login screen between tests. With that said, we don't want to test this part of the operation, only the part that happens on once the actual test begins. For this reason we provide a few helpers so that you can provide your own reset function without it counting against your performance metrics.  Essentially a reset function gets a free pass from a performance standpoint since it really isn't part of the feature under test.

## Prerequisites

- Install testcafe locally in your project.
- Install timecafe `yarn add timecafe --dev  # or: npm install --save-dev timecafe`

## Usage

You must do three to use TimeCafe:

- Provide a reset function (to be run untimed between timed tests)
- Add some code tests that you want timed
- Run the test command!

### The reset function

The reset function is probably the hardest part of setting up TimeCafe but once it is done, you'll use it in all your tests.

Create a file to hold your reset functionality. Remember that this is the untimed functionality that will run between timed tests. It can still have assertions in it of course.  Let's call this `login.js` (note that we don't include .test.js as the extension since it will be imported into our tests). All our reset function is doing is saying that between tests we want the browser to go back to the login page.

```javascript
import { Selector } from 'testcafe';
import timecafe from 'timecafe';

const login = async t => {
  await t.navigateTo('http://localhost:9000/login');
  const contentArea = await Selector('.content-area').find('h1');

  await t
    .expect(contentArea.innerText)
    .contains('Login:', 'The login header is shown');
};

export default login;
export const time = timecafe(login);
```

Notice that there are two exports, one is the original login function. The second is variable called `time`. By wrapping your reset function in timecafe() you're making sure that any tests you'd like to time will be able to do so. We're almost done but there is one important part left. Let's look at how you would actually time a test using the reset function that we previously defined in `login.js`.

### Your tests that you want timed

Ok, we've got `login.js` done so now we just need to use it in our tests.

First, if you don't already have a file to put your tests in, let's do so now. Create `index.test.js` and add something resembling the following. Note the selectors being used are based on an Angular 1 app so you should swap them out with your own:

```javascript
import { Selector } from "testcafe";
import {time} from './login';

// NOTE IMPORTANT MAKE SURE THAT YOU PUT IN AN EXACT URL AND NOT ONE THAT WILL REDIRECT
// OTHERWISE THE PAGE WILL REDIRECT AND BE BLOWN AWAY
fixture `Admin Testing`
  .page `http://localhost:9000/login`
  .beforeEach(time.start());

test("App builder", async t => {
  // Action
  await t.click('a[ui-sref="admin"]').click('a[ui-sref="admin.builder"]');

  // Query
  const subHeader = await Selector(".content-area").find("ui-view").find("h5");

  // Test
  await t
    .expect(subHeader.innerText)
    .contains("app builder", "The app builder header is displayed");

  // Always return to the login screen (manually this time) when done to stop the counter
  await time.finish(t);
});

```

Please note that time.start() does not require you to pass in a test explicitly, however time.finish(t) does require it because it needs to know which test to actually register as finished.

### Run the tests

You can execute your tests with `$(npm bin)/testcafe chrome ./index.test.js -e`

And you should expect output that looks like this:

```bash
Running tests in:
- Chrome 57.0.2987 / Mac OS X 10.12.4

Admin Testing

  Done in 0.422129062s.
✓ App builder


1 passed (2s)
```

Note that due to current limitations the time actually is recorded directly before the test name.

## Additional notes

Internally we use node's high resolution timing function `process.hrtime()`.

Ironically tests don't exist.

## Author

Jim Cummins ([@jimthedev](https://twitter.com/jimthedev))
