/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package jhipster.files;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.lang.reflect.AnnotatedType;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Scanner;

/**
 *
 * @author mfernandes
 */
public class Resources {

    public static Scanner getResource(String name) {
        return new Scanner(
                Resources.class.getResourceAsStream(name));
    }

    public static InputStream getResourceStream(String name) {
        return Resources.class.getResourceAsStream(name);
    }

    public static boolean storeResource(String name, String local) {
        File file = new File(local);

        try {
            file.mkdirs();
        } catch (Exception e) {
            System.err.println(e);
        }

        try {
            file = new File(local + name);
            file.createNewFile();
            Files.copy(getResourceStream(name), file.toPath(), StandardCopyOption.REPLACE_EXISTING);
            return true;
        } catch (Exception e) {
            System.err.println("Impossivel criar arquivo " + name + " em " + local);
            System.err.println(e);
        }
        return false;
    }

    public static void appendFile(String text, String file) {
        try {

            File f = new File(file);
            if (!f.exists()) {
                f.createNewFile();
            }
            FileWriter fw = new FileWriter(f, true);
            fw.append("\n" + text);
            fw.close();
        } catch (Exception ex) {
            System.err.println(ex);
        }
    }

    public static void prependFile(String text, String file) {

        try {
            ArrayList ar = new ArrayList();
            Collections.addAll(ar, text.split("\n"));

            File f = new File(file);

            if (!f.exists()) {
                f.createNewFile();
            } else {
                Scanner sc = new Scanner(f);
                while (sc.hasNextLine()) {
                    String next = sc.nextLine();
                    ar.add(next);
                }
            }

            FileWriter fw = new FileWriter(f, false);
            StringBuffer sb = new StringBuffer();
            ar.forEach((line) -> {
                sb.append(line + "\n");
            });
            fw.write(sb.toString());
            fw.close();
        } catch (Exception ex) {
            System.err.println(ex);
        }

    }

    public static void insertOnFile(String text, String depoisDe, String file, boolean incluirLinha) {
        try {
            ArrayList ar = new ArrayList();
            boolean inseriu = false;

            File f = new File(file);

            if (!f.exists()) {
                f.createNewFile();
                Collections.addAll(ar, text.split("\n"));
            } else {
                Scanner sc = new Scanner(f);
                while (sc.hasNextLine()) {
                    String next = sc.nextLine();
                    if (incluirLinha) {
                        ar.add(next);
                    }

                    if (next.endsWith(depoisDe) && !inseriu) {
                        Collections.addAll(ar, text.split("\n"));
                        incluirLinha = inseriu = true;
                        continue;
                    }

                    if (!incluirLinha) {
                        ar.add(next);
                    }
                }
                if (!inseriu) {
                    Collections.addAll(ar, text.split("\n"));
                }
            }

            FileWriter fw = new FileWriter(f, false);
            StringBuffer sb = new StringBuffer();
            ar.forEach((line) -> {
                sb.append(line + "\n");
            });
            fw.write(sb.toString());
            fw.close();
        } catch (Exception ex) {
            System.err.println(ex);
        }
    }

    public static void insertOnIntervalo(String text, String regexDepoisDe, String regexAte, boolean includeDe, boolean includeAte, String file) {
        insertOnIntervaloFile(text, regexDepoisDe, regexAte, includeDe, includeAte, new File(file));
    }

    public static void insertOnIntervaloFile(String text, String regexDepoisDe, String regexAte, boolean includeDe, boolean includeAte, File file) {
        try {
            ArrayList ar = new ArrayList();
            boolean inseriu = false, inserir = false;

            if (!file.exists()) {
                file.createNewFile();
                Collections.addAll(ar, text.split("\n"));
            } else {
                Scanner sc = new Scanner(file);
                while (sc.hasNextLine()) {
                    String next = sc.nextLine();

                    if (inseriu) {
                        if (inserir) {
                            ar.add(next);
                        } else if (next.matches(regexAte)) {
                            if (includeAte) {
                                ar.add(next);
                            }
                            inserir = true;
                        }
                    } else {

                        if (next.matches(regexDepoisDe)) {

                            if (includeDe) {
                                ar.add(next);
                            }

                            Collections.addAll(ar, text.split("\n"));
                            inseriu = true;

                        } else {
                            ar.add(next);
                        }

                    }
                }
                if (!inseriu) {
                    Collections.addAll(ar, text.split("\n"));
                }
            }

            FileWriter fw = new FileWriter(file, false);
            StringBuffer sb = new StringBuffer();
            ar.forEach((line) -> {
                sb.append(line + "\n");
            });
            fw.write(sb.toString());
            fw.close();
        } catch (Exception ex) {
            System.err.println(ex);
        }
    }

    public static void replaceAfter(String text, String depoisDe, String file, boolean retirarALinha) {
        try {
            ArrayList ar = new ArrayList();
            boolean inseriu = false;

            File f = new File(file);

            if (!f.exists()) {
                f.createNewFile();
                Collections.addAll(ar, text.split("\n"));
            } else {
                Scanner sc = new Scanner(f);
                while (sc.hasNextLine()) {

                    if (inseriu) {
                        break;
                    }
                    String next = sc.nextLine();
                    if (next.endsWith(depoisDe)) {

                        if (!retirarALinha) {
                            ar.add(next);
                        }
                        Collections.addAll(ar, text.split("\n"));
                        inseriu = true;
                    } else {
                        ar.add(next);
                    }
                }
                if (!inseriu) {
                    Collections.addAll(ar, text.split("\n"));
                }
            }

            FileWriter fw = new FileWriter(f, false);
            StringBuffer sb = new StringBuffer();
            ar.forEach((line) -> {
                sb.append(line + "\n");
            });
            fw.write(sb.toString());
            fw.close();
        } catch (Exception ex) {
            System.err.println(ex);
        }
    }

    public static String projeto = "",
            retirarDeFileNome = null,
            acresAntesDeFileNome = null,
            acresDepoisDeFileNome = null;

    public static void applyInMassa(String diretorio, String include, String exclude, String metodo, Object[] params, int alter) {
        try {
            for (Method m : Resources.class.getMethods()) {
                if (m.getName().equals(metodo)) {
                    File[] files = getFilesWithPattern(diretorio, include, exclude);

                    int cont = 0;

                    for (Object param : params) {
                        if ((param instanceof File) || cont > 100) {
                            break;
                        }
                        cont++;
                    }
                    if (cont < 100) {

                        int cont2 = 0;
                        Object backup = null;
                        if (alter >= 0) {
                            backup = params[alter];
                        }

                        for (File file : files) {

                            if (m.getParameters()[cont].getAnnotatedType().getType().getTypeName().equals("java.lang.String")) {
                                params[cont] = file.getAbsolutePath();
                            } else {
                                params[cont] = file;
                            }

                            if (alter >= 0) {
                                params[alter] = ((String) params[alter]).replace("${{cont}}$", Integer.toString(cont2));
                                params[alter] = ((String) params[alter]).replace("${{filename}}$",file.getName().split("\\.")[0]);
                                params[alter] = ((String) params[alter]).replace("${{filenameAlterado}}$",
                                        (acresAntesDeFileNome == null ? "" : acresAntesDeFileNome)
                                        + (retirarDeFileNome == null ? file.getName().split("\\.")[0] : file.getName().split("\\.")[0].replace(retirarDeFileNome, ""))
                                        + (acresDepoisDeFileNome == null ? "" : acresDepoisDeFileNome));
                                params[alter] = ((String) params[alter]).replace("${{filenamealterado}}$",
                                        (acresAntesDeFileNome == null ? "" : acresAntesDeFileNome)
                                        + (retirarDeFileNome == null ? file.getName().split("\\.")[0] : file.getName().split("\\.")[0].replace(retirarDeFileNome, "")).toLowerCase()
                                        + (acresDepoisDeFileNome == null ? "" : acresDepoisDeFileNome));
                                params[alter] = ((String) params[alter]).replace("${{projeto}}$", projeto);

                            }

                            executeOnMethod(m, params);
                            cont2++;

                            if (alter >= 0) {
                                params[alter] = backup;
                            }
                        }

                    } else {
                        System.err.println("Erro FILE nao encontradfo em Object[]");
                    }

                }
            }
        } catch (Exception e) {
            System.err.println("Erro falhou ao lanbcar metodo " + metodo + " com " + params);
            System.err.println(e);
        }

    }

    public static void executeOnMethod(Method m, Object[] params) throws Exception {
        switch (params.length) {
            case 1:
                m.invoke(null, params[0]);
                break;
            case 2:
                m.invoke(null, params[0], params[1]);
                break;
            case 3:
                m.invoke(null, params[0], params[1], params[2]);
                break;
            case 4:
                m.invoke(null, params[0], params[1], params[2], params[3]);
                break;
            case 5:
                m.invoke(null, params[0], params[1], params[2], params[3], params[4]);
                break;
            case 6:
                m.invoke(null, params[0], params[1], params[2], params[3], params[4], params[5]);
                break;
        }
    }

    public static File[] getFilesWithPattern(String diretorio, String include, String exclude) {
        ArrayList<File> files = new ArrayList<>();
        try {
            String[] fs = list(new File(diretorio), include, exclude).split(",");
            for (String f : fs) {
                if (f != null && !f.isEmpty() && f.length() > 2) {
                    files.add(new File(f));
                }
            }
        } catch (Exception ex) {
            System.err.println("erro " + ex);
        }
        return files.toArray(new File[]{});
    }

    public static String list(File file, String include, String exclude) {
        String files = "";
        if (file.isDirectory()) {
            for (File f : file.listFiles()) {
                files += "," + list(f, include, exclude);
            }
        } else if (file.getAbsolutePath().matches(include) && !file.getAbsolutePath().matches(exclude)) {
            return file.getAbsolutePath();
        }
        return files;
    }

    public static void insertOnPositionFile(String text, int aposIni, int antesEnd, String file) {

        try {
            ArrayList ar = new ArrayList();

            File f = new File(file);

            if (!f.exists()) {
                f.createNewFile();
                Collections.addAll(ar, text.split("\n"));
            } else {
                Scanner sc = new Scanner(f);
                while (sc.hasNextLine()) {

                    String next = sc.nextLine();

                    ar.add(next);

                }

                if (aposIni >= 0) {
                    ar.add(aposIni, text);
                }
                if (antesEnd >= 0) {
                    ar.add(ar.size() - antesEnd, text);
                }

            }

            FileWriter fw = new FileWriter(f, false);
            StringBuffer sb = new StringBuffer();
            ar.forEach((line) -> {
                sb.append(line + "\n");
            });
            fw.write(sb.toString());
            fw.close();
        } catch (Exception ex) {
            System.err.println(ex);
        }

    }

    public static void storeFilePrivilegios(String local, String projeto) {
        try {
            String data = "package com.mikeias." + projeto + ".service;\n"
                    + "\n"
                    + "import com.mikeias." + projeto + ".domain.Cargo;\n"
                    + "import com.mikeias." + projeto + ".repository.CargoRepository;\n"
                    + "import java.util.List;\n"
                    + "\n"
                    + "public class PrivilegioService {\n"
                    + "\n"
                    + "\n"
                    + "    public static boolean hasPermissao(CargoRepository cargoRepository, String entidade, int nivel) {\n"
                    + "\n"
                    + "        List<Cargo> cgs = cargoRepository.getCargosOfCurrentUser();\n"
                    + "        for (Cargo c : cgs) {\n"
                    + "\n"
                    + "            if (c.getPermissao() != null &&\n"
                    + "                    !c.getPermissao().isEmpty() &&\n"
                    + "                    c.getPermissao().contains(entidade + \"-\" + getNivel(nivel)))\n"
                    + "                return true;\n"
                    + "\n"
                    + "        }\n"
                    + "\n"
                    + "        return false;\n"
                    + "    }\n"
                    + "\n"
                    + "\n"
                    + "    public static String getNivel(int nivel) {\n"
                    + "        switch (nivel) {\n"
                    + "            case 1:\n"
                    + "                return \"visualizar\";\n"
                    + "            case 2:\n"
                    + "                return \"adicionar\";\n"
                    + "            case 3:\n"
                    + "                return \"editar\";\n"
                    + "            case 4:\n"
                    + "                return \"deletar\";\n"
                    + "        }\n"
                    + "        return null;\n"
                    + "    }\n"
                    + "\n"
                    + "\n"
                    + "    public static boolean podeVer(CargoRepository cargoRepository, String entidade) {\n"
                    + "        return hasPermissao(cargoRepository, entidade, 1);\n"
                    + "    }\n"
                    + "\n"
                    + "    public static boolean podeCriar(CargoRepository cargoRepository, String entidade) {\n"
                    + "        return hasPermissao(cargoRepository, entidade, 2);\n"
                    + "    }\n"
                    + "\n"
                    + "    public static boolean podeEditar(CargoRepository cargoRepository, String entidade) {\n"
                    + "        return hasPermissao(cargoRepository, entidade, 3);\n"
                    + "    }\n"
                    + "\n"
                    + "    public static boolean podeDeletar(CargoRepository cargoRepository, String entidade) {\n"
                    + "        return hasPermissao(cargoRepository, entidade, 4);\n"
                    + "    }\n"
                    + "\n"
                    + "\n"
                    + "}";
            FileWriter fw = new FileWriter(local);
            fw.write(data);
            fw.close();
        } catch (Exception ex) {
            System.err.println("impossivel criar file priovilegios..." + ex);
        }
    }

}
