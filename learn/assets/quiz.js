const initQuizzes = () => {
  const quizzes = document.querySelectorAll("[data-quiz]");

  quizzes.forEach((quiz) => {
    const buttons = [...quiz.querySelectorAll("button[data-correct]")];
    const feedback = quiz.querySelector(".quiz-feedback");
    if (!feedback || buttons.length === 0) return;

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const correct = button.getAttribute("data-correct") === "true";
        buttons.forEach((other) => {
          other.disabled = true;
          other.dataset.state =
            other.getAttribute("data-correct") === "true" ? "right" : "wrong";
        });
        feedback.hidden = false;
        feedback.textContent = correct
          ? (quiz.getAttribute("data-right") ?? "Correct.")
          : (quiz.getAttribute("data-wrong") ?? "Not quite.");
      });
    });
  });
};

initQuizzes();
