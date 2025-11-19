// Source - https://stackoverflow.com/a
// Posted by valscion
// Retrieved 2025-11-17, License - CC BY-SA 4.0

// # cy.get('#map-canvas').dragMapFromCenter({ xMoveFactor: 0.25, yMoveFactor: -0.5 })
//
// Allows dragging a Leaflet map by the given amounts. A factor of 1 means the map
// will be dragged the whole width of the map canvas in X direction and the whole
// height of the map canvas in Y direction.
Cypress.Commands.add(
    'dragMapFromCenter',
    { prevSubject: 'element' },
    (element, { xMoveFactor, yMoveFactor }) => {
        // Get the raw HTML element from jQuery wrapper
        const canvas = element.get(0);
        const rect = canvas.getBoundingClientRect();
        const center = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };

        // Start dragging from the center of the map
        cy.log('mousedown', {
            clientX: center.x,
            clientY: center.y
        });
        canvas.dispatchEvent(
            new MouseEvent('mousedown', {
                clientX: center.x,
                clientY: center.y
            })
        );

        // Let Leaflet know the mouse has started to move. The diff between
        // mousedown and mousemove event needs to be large enough so that Leaflet
        // will really think the mouse is moving and not that it was a click where
        // the mouse moved just a tiny amount.
        cy.log('mousemove', {
            clientX: center.x,
            clientY: center.y + 50
        });
        canvas.dispatchEvent(
            new MouseEvent('mousemove', {
                clientX: center.x,
                clientY: center.y + 50,
                bubbles: true
            })
        );

        // After Leaflet knows mouse is moving, we move the mouse as depicted by the options.
        cy.log('mousemove', {
            clientX: center.x + rect.width * xMoveFactor,
            clientY: center.y + rect.height * yMoveFactor
        });
        canvas.dispatchEvent(
            new MouseEvent('mousemove', {
                clientX: center.x + rect.width * xMoveFactor,
                clientY: center.y + rect.height * yMoveFactor,
                bubbles: true
            })
        );

        // Now when we "release" the mouse, Leaflet will fire a "dragend" event and
        // the search should register that the drag has stopped and run callbacks.
        cy.log('mouseup', {
            clientX: center.x + rect.width * xMoveFactor,
            clientY: center.y + rect.height * yMoveFactor
        });
        requestAnimationFrame(() => {
            canvas.dispatchEvent(
                new MouseEvent('mouseup', {
                    clientX: center.x + rect.width * xMoveFactor,
                    clientY: center.y + rect.height * yMoveFactor,
                    bubbles: true
                })
            );
        });
    }
);
