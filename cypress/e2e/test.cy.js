import { CREDIBILITY_CONFIGS } from "../results/expected_results";

describe('Przykładowe uzupełnienie ankiety', () => {
    it('Przykładowe uzupełnienie ankiety', () => {
        const expectedResults = CREDIBILITY_CONFIGS;

        cy.visit('/');

        // START
        cy.get("button").first().click();
        cy.get("input").first().type(100);
        cy.get("input").eq(1).parent().click();
        cy.get("li").first().click();
        cy.get("button").eq(1).click();

        // QUESTION 1
        let inputNumberIterator = 0;
        let questionStartTime = 0;
        cy.then(() => {
            questionStartTime = Date.now();
        })

        for (let i = 0; i < expectedResults[0].inactivityPeriods.length; i++) {
            cy.window().then(win => {
                win.dispatchEvent(new MouseEvent("mousemove", { clientX: 100, clientY: 100 }));
            });
            cy.wait(expectedResults[0].inactivityPeriods[i]);
            cy.window().then(win => {
                win.dispatchEvent(new MouseEvent("mousemove", { clientX: 100, clientY: 100 }));
            });
        }

        for (let i = 0; i < expectedResults[0].attempts; i++) {
            cy.get("input").eq(inputNumberIterator % 3).click();
            inputNumberIterator++;
        }

        cy.then(() => {
            const elapsed = Date.now() - questionStartTime;
            const remaining = expectedResults[0].timeSpent - elapsed;
            if (remaining > 0) cy.wait(remaining);
        });

        cy.get("button").last().click();

        // QUESTION 2

        cy.then(() => {
            questionStartTime = Date.now();
        })

        const numberOfQuestions = 4;
        const answersPerQuestion = 3;
        let answersCounter = 0;

        for (let i = 0; i < numberOfQuestions; i++) {
            cy.get("input").eq(i * answersPerQuestion + answersCounter).click();
        }
        answersCounter++;

        for (let i = 0; i < expectedResults[1].attempts - 1; i++) {
            cy.get("input").eq(i * answersPerQuestion + answersCounter).click();
        }

        cy.then(() => {
            const elapsed = Date.now() - questionStartTime;
            const remaining = expectedResults[1].timeSpent - elapsed;
            if (remaining > 0) cy.wait(remaining);
        });

        cy.get("button").last().click();

        // QUESTION 3
        cy.then(() => {
            questionStartTime = Date.now();
        })
        inputNumberIterator = 0;

        // leave tab simulation
        cy.window().then(win => {
            Object.defineProperty(win.document, 'visibilityState', { configurable: true, value: 'hidden' });
            Object.defineProperty(win.document, 'hidden', { configurable: true, value: true });
            win.document.dispatchEvent(new Event('visibilitychange'));
        });

        cy.wait(expectedResults[2].timeOutsideTab);

        cy.window().then(win => {
            Object.defineProperty(win.document, 'visibilityState', { configurable: true, value: 'visible' });
            Object.defineProperty(win.document, 'hidden', { configurable: true, value: false });
            win.document.dispatchEvent(new Event('visibilitychange'));
        });

        Cypress._.times(expectedResults[2].attempts, () => {
            cy.get("input").eq(inputNumberIterator % 3).click();
            inputNumberIterator++;
        });

        cy.then(() => {
            const elapsed = Date.now() - questionStartTime;
            const remaining = expectedResults[2].timeSpent - elapsed;
            if (remaining > 0) cy.wait(remaining);
        });

        cy.get("button").last().click();

        // QUESTION 4
        cy.then(() => {
            questionStartTime = Date.now();
        })

        Cypress._.times(expectedResults[3].clicks, () => {
            cy.get(".leaflet-container").click(
                Math.floor(100 + Math.random() * 100),
                Math.floor(100 + Math.random() * 100)
            );
            cy.wait(500);;
        });

        Cypress._.times(expectedResults[3].zoomIns, () => {
            cy.get('.leaflet-control-zoom-in').first().click();
            cy.wait(500);
        });

        Cypress._.times(expectedResults[3].zoomOuts, () => {
            cy.get('.leaflet-control-zoom-out').first().click();
            cy.wait(500);
        });

        Cypress._.times(expectedResults[3].drags, () => {
            cy.get('.leaflet-container').dragMapFromCenter({ xMoveFactor: 0.25, yMoveFactor: -0.5 });
        });

        Cypress._.times(expectedResults[3].attempts, () => {
            cy.get("button").first().click();
            cy.get(".leaflet-container").click(
                Math.floor(100 + Math.random() * 100),
                Math.floor(100 + Math.random() * 100)
            );
        });

        cy.then(() => {
            const elapsed = Date.now() - questionStartTime;
            const remaining = expectedResults[3].timeSpent - elapsed;
            if (remaining > 0) cy.wait(remaining);
        });

        cy.get("button").last().click();

        // QUESTION 5
        cy.then(() => {
            questionStartTime = Date.now();
        })

        Cypress._.times(expectedResults[4].attempts, () => {
            cy.get("button").first().click();
            cy.get(".leaflet-container").click(
                Math.floor(100 + Math.random() * 100),
                Math.floor(100 + Math.random() * 100)
            );
        });

        cy.then(() => {
            const elapsed = Date.now() - questionStartTime;
            const remaining = expectedResults[4].timeSpent - elapsed;
            if (remaining > 0) cy.wait(remaining);
        });

        cy.get("button").last().click();

        // QUESTION 6

        cy.then(() => {
            questionStartTime = Date.now();
        })

        Cypress._.times(expectedResults[5].attempts, () => {
            cy.get("button").first().click();

            cy.wait(500)

            cy.wrap([...expectedResults[5].timeStamps, 1]).each((stamp) => {
                cy.get(".leaflet-container").click(
                    Math.floor(100 + Math.random() * 100),
                    Math.floor(100 + Math.random() * 100)
                );
                cy.wait(stamp);
            });

            cy.get("button").eq(1).click();
        });

        cy.then(() => {
            const elapsed = Date.now() - questionStartTime;
            const remaining = expectedResults[5].timeSpent - elapsed;
            if (remaining > 0) cy.wait(remaining);
        });

        cy.get("button").last().click();

        // QUESTION 7
        cy.then(() => {
            questionStartTime = Date.now();
        })

        Cypress._.times(expectedResults[6].attempts, () => {
            cy.get("button").first().click();
            cy.get(".leaflet-container").click(
                Math.floor(100 + Math.random() * 100),
                Math.floor(100 + Math.random() * 100)
            );
            cy.get(".leaflet-container").click(
                Math.floor(100 + Math.random() * 100),
                Math.floor(100 + Math.random() * 100)
            );
        });

        cy.then(() => {
            const elapsed = Date.now() - questionStartTime;
            const remaining = expectedResults[6].timeSpent - elapsed;
            if (remaining > 0) cy.wait(remaining);
        });

        cy.get("button").last().click();

        // QUESTION 8
        cy.then(() => {
            questionStartTime = Date.now();
        })

        Cypress._.times(expectedResults[7].attempts, () => {
            cy.get("button").first().click();
            cy.get(".leaflet-container").click(
                Math.floor(100 + Math.random() * 100),
                Math.floor(100 + Math.random() * 100)
            );
        });

        cy.then(() => {
            const elapsed = Date.now() - questionStartTime;
            const remaining = expectedResults[7].timeSpent - elapsed;
            if (remaining > 0) cy.wait(remaining);
        });

        cy.get("button").last().click();

        // QUESTION 9
        cy.then(() => {
            questionStartTime = Date.now();
        })

        Cypress._.times(expectedResults[8].attempts, () => {
            cy.get("button").first().click();
            cy.get(".leaflet-container").click(
                Math.floor(100 + Math.random() * 100),
                Math.floor(100 + Math.random() * 100)
            );
        });

        cy.then(() => {
            const elapsed = Date.now() - questionStartTime;
            const remaining = expectedResults[8].timeSpent - elapsed;
            if (remaining > 0) cy.wait(remaining);
        });

        cy.get("button").last().click();

        // QUESTION 10
        cy.then(() => {
            questionStartTime = Date.now();
        })

        Cypress._.times(expectedResults[9].attempts, () => {
            cy.get("button").first().click();

            cy.wait(500)

            cy.wrap([...expectedResults[9].timeStamps, 1]).each((stamp) => {
                cy.get(".leaflet-container").click(
                    Math.floor(100 + Math.random() * 100),
                    Math.floor(100 + Math.random() * 100)
                );
                cy.wait(stamp);
            });

            cy.get("button").eq(1).click();
        });

        cy.then(() => {
            const elapsed = Date.now() - questionStartTime;
            const remaining = expectedResults[9].timeSpent - elapsed;
            if (remaining > 0) cy.wait(remaining);
        });

        cy.get("button").last().click();

        // QUESTION 11
        cy.then(() => {
            questionStartTime = Date.now();
        })

        Cypress._.times(expectedResults[10].attempts, () => {
            cy.get('.MuiSlider-root').then($slider => {
                const rect = $slider[0].getBoundingClientRect();

                const x = rect.left + rect.width * 0.8;
                const y = rect.top + rect.height / 2;

                cy.wrap($slider)
                    .click(x - rect.left, y - rect.top, { force: true });
            });
        });

        cy.then(() => {
            const elapsed = Date.now() - questionStartTime;
            const remaining = expectedResults[10].timeSpent - elapsed;
            if (remaining > 0) cy.wait(remaining);
        });

        cy.get("button").last().click();


        // QUESTION 12
        inputNumberIterator = 0;
        cy.then(() => {
            questionStartTime = Date.now();
        })

        Cypress._.times(expectedResults[11].attempts, () => {
            cy.get("input").eq(inputNumberIterator % 3).click();
            inputNumberIterator++;
        });


        cy.then(() => {
            const elapsed = Date.now() - questionStartTime;
            const remaining = expectedResults[11].timeSpent - elapsed;
            if (remaining > 0) cy.wait(remaining);
        });

        cy.get("button").last().click();
    });
});
