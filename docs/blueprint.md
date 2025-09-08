# **App Name**: DoseWise Visualizer

## Core Features:

- Data Import: Allows users to import medication schedule data from a CSV file. Parses columns `medication_name`, `prescribed_time`, and `actual_intake_time`.
- Adherence Timeline Chart: Generates a timeline chart plotting prescribed vs. actual intake times to visually represent deviations and adherence patterns.
- Time-of-Day Heatmap: Creates a heatmap showing medication adherence levels at different hours of the day, providing insights into optimal timing strategies. This tool is based on pattern recognition to assess optimal timing.
- Compliance Score Calculation: Calculates and displays the overall medication compliance percentage, indicating the proportion of on-time doses relative to total prescribed doses.
- Interactive Data Points: Enables users to hover over data points on charts for detailed information about specific doses and intake times.
- Automated Remediation Advisor: An advisor suggests appropriate reasons for missing medications. The app provides these options using an LLM tool: forgot, side effects, change in routine. After user confirms reason, display adherence calendar based on the information, and suggest better intake times for each drug in the prescription.

## Style Guidelines:

- Primary color: Deep teal (#2E8B8B) to evoke a sense of trust and reliability in a healthcare setting.
- Background color: Light cyan (#E0FFFF) provides a clean, professional backdrop.
- Accent color: Soft amber (#F08000) to highlight crucial data points and interactive elements.
- Body and headline font: 'Inter', a sans-serif font known for its clarity and modern appearance, suitable for both headlines and body text.
- Use clean, minimalist icons to represent various medication types and adherence metrics.
- Dashboard layout should be clean and intuitive, prioritizing key visualizations and compliance scores.
- Subtle transitions and animations when interacting with charts and data points to enhance user experience.