# Relay Dispatch Dashboard

A dashboard for managing and monitoring radio communication links.

Live Demo: [Relay Dispatch Dashboard](https://relay-dispatch-demo.vercel.app/)

## Design Considerations
The target user group is the primary motivation for each of the dashboard's design decisions. The intended user is a police dispatch operator responsible for maintaining and monitoring radio communications, so the primary design consideration I focused on was the user's need to quickly and easily identify signal status. I decided to create a minimalist approach with compact spacing, clean lines, and, most importantly, clear and intuitive status indicators.

### Structure
The application is broken down into 4 main components: a header, filter and sort controls, the signal cards, and the activity panel. The header is minimal, with the main objective of orienting the user by providing the application name, logo, and the operator on shift. The controls are an additional feature I decided to include to give the operator more control over the information they see first. Providing filter and sort capabilities is a simple and effective way to give operators the ability to prioritize the information most relevant to them. Finally, the signal cards are the content the operator explicitly wants to see. I decided to organize each signal into its own card and to orient them vertically to allow the operator to quickly scan all channels. Channel names and their corresponding status are clearly indicated in the header of each signal card so an operator can easily find what they need. That column of cards holds to the left of the window and the selected channel's activity fills the panel on the right. When the screen width becomes too narrow, the activity panel appears underneath the selected channel instead, similar to an accordion.

### Functionality
I took the step to make the channels selectable to enable a more complete viewing of the signal's live feed. This decision was similarly motivated by the target user group. Given the operator's role monitoring dispatch communications, they would very likely need more context than the 2-3 lines displayed by default. The 3 lines are displayed by default to keep the interface clean and minimal, but I wanted to provide operators with the opportunity to view the full context of the feed if desired. In the same spirit, I added a download button to each signal feed. The download and expand buttons follow the dashboard's overall design of minimalism. They are compact and out of the way, available if the user needs them but not in the user's face, distracting them from their main task.

### Color Scheme
The dashboard's colors are also inspired by the target user group. The background has a deep blue hue subtly tying into the police dispatch theme. Status colors are standard green and red for active and error states, respectively, as well as a light blue chosen for the standby state, representing a neutral state not requiring operator attention. Status indicators have proper contrast from their background and are always displayed with either an icon or text in addition to the color to ensure accessibility for all users.

### Conclusion
Each of the components of the dashboard contributes to creating a single cohesive theme that puts the operator's mission at the forefront. The UI is not distracting or disorienting; rather, it guides the user to the information that they care most about and provides them the tools they need to complete their job successfully.

