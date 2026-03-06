import flet as ft
import requests

API_URL = "http://127.0.0.1:8000"  # ajuste para a URL pública do seu backend quando for deployar


def main(page: ft.Page):
    page.title = "WMS – Login"
    page.window_width = 400
    page.window_height = 520
    page.padding = 20
    page.spacing = 20
    page.theme_mode = ft.ThemeMode.LIGHT

    # --- Campos de entrada ---
    email = ft.TextField(label="Email", autofocus=True, width=350)
    password = ft.TextField(label="Senha", password=True, can_reveal_password=True, width=350)

    # Mensagens de feedback (SnackBar)
    def show_snack(text: str, success: bool = False):
        page.snack_bar = ft.SnackBar(
            content=ft.Text(text, weight=ft.FontWeight.BOLD),
            bgcolor=ft.Colors.GREEN_400 if success else ft.Colors.RED_400,
            duration=3000,
        )
        page.snack_bar.open = True
        page.update()

    # ------------------------ LOGIN ------------------------ #
    def login_click(_):
        if not email.value or not password.value:
            show_snack("Preencha email e senha.")
            return
        try:
            resp = requests.post(
                f"{API_URL}/login",
                json={"email": email.value, "senha": password.value},
                timeout=10,
            )
            if resp.status_code == 200:
                data = resp.json()
                show_snack(f"Bem‑vindo, {data['nome']}!", success=True)
                # TODO: navegar para o dashboard principal
            else:
                show_snack(resp.json().get("detail", "Erro de login."))
        except Exception as ex:
            show_snack(f"Falha de conexão: {ex}")

    # ------------------------ REGISTRO ------------------------ #
    reg_nome = ft.TextField(label="Nome completo", width=350)
    reg_email = ft.TextField(label="Email", width=350)
    reg_pass = ft.TextField(label="Senha", password=True, can_reveal_password=True, width=350)

    def do_register(_):
        if not all([reg_nome.value, reg_email.value, reg_pass.value]):
            show_snack("Preencha todos os campos.")
            return
        try:
            resp = requests.post(
                f"{API_URL}/register",
                json={
                    "nome": reg_nome.value,
                    "email": reg_email.value,
                    "senha": reg_pass.value,
                },
                timeout=10,
            )
            if resp.status_code == 200:
                dlg.open = False
                show_snack("Usuário registrado! Faça login.", success=True)
            else:
                show_snack(resp.json().get("detail", "Falha no registro."))
        except Exception as ex:
            show_snack(f"Falha de conexão: {ex}")
        page.update()

    dlg = ft.AlertDialog(
        modal=True,
        title=ft.Text("Registrar novo usuário"),
        content=ft.Column([reg_nome, reg_email, reg_pass], tight=True, spacing=10),
        actions=[
            ft.TextButton("Cancelar", on_click=lambda _: setattr(dlg, "open", False)),
            ft.FilledButton("Registrar", on_click=do_register),
        ],
        actions_alignment=ft.MainAxisAlignment.END,
    )

    def open_register(_):
        reg_nome.value = ""
        reg_email.value = ""
        reg_pass.value = ""
        dlg.open = True
        page.dialog = dlg
        page.update()

    # ------------------------ UI Layout ------------------------ #
    login_btn = ft.FilledButton("Entrar", on_click=login_click, width=350)
    register_btn = ft.TextButton("Criar conta", on_click=open_register)

    page.add(
        ft.Column(
            horizontal_alignment=ft.CrossAxisAlignment.CENTER,
            spacing=15,
            controls=[
                ft.Text("WMS", size=32, weight=ft.FontWeight.W_700),
                ft.Text("Área de Login", size=18, weight=ft.FontWeight.W_600),
                email,
                password,
                login_btn,
                register_btn,
            ],
        )
    )


ft.app(target=main)
